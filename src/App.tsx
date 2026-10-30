/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LESSONS, TIMED_PASSAGES } from './data/lessonsData';
import { getGuidanceForChar } from './data/keyboardData';
import { KeyFeedbackEvent, Lesson, PracticeMode, SessionRecord } from './types';
import { TypingCanvas } from './components/TypingCanvas';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { SessionSummary } from './components/SessionSummary';
import { CurriculumSection } from './components/CurriculumSection';
import { FingerGuideSection } from './components/FingerGuideSection';
import { StatsSection } from './components/StatsSection';
import { SidebarRail, ActiveNavSection } from './components/SidebarRail';
import { soundEngine } from './utils/sound';

const STORAGE_KEY = 'muoingon_typing_history_v1';

const DEFAULT_CUSTOM_TEXT =
  'Hãy dán hoặc nhập bất kỳ đoạn văn bản tiếng Việt, tiếng Anh hoặc đoạn mã lập trình nào mà bạn muốn luyện gõ bằng mười ngón tay vào đây.';

export default function App() {
  // Mode & Content Selection
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.Lesson);
  const [activeLessonId, setActiveLessonId] = useState<string>(LESSONS[0].id);
  const [exerciseIdx, setExerciseIdx] = useState<number>(0);

  // Timed test settings
  const [timedDuration, setTimedDuration] = useState<30 | 60 | 120>(60);
  const [timedLang, setTimedLang] = useState<'vi' | 'viNoTone' | 'en'>('vi');
  const [timedPassageIdx, setTimedPassageIdx] = useState<number>(0);

  // Custom text state
  const [customDraft, setCustomDraft] = useState<string>(DEFAULT_CUSTOM_TEXT);
  const [appliedCustomText, setAppliedCustomText] = useState<string>(DEFAULT_CUSTOM_TEXT);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);

  // Visual & Sound Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [errorSoundEnabled, setErrorSoundEnabled] = useState<boolean>(true);
  const [showFingerZones, setShowFingerZones] = useState<boolean>(true);
  const [showHandSvg, setShowHandSvg] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<ActiveNavSection>('san-tap');

  // Active Typing Session State
  const [typedText, setTypedText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [missedChars, setMissedChars] = useState<Record<string, number>>({});
  const [lastRecord, setLastRecord] = useState<SessionRecord | null>(null);
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
  const [keyFeedback, setKeyFeedback] = useState<KeyFeedbackEvent | null>(null);

  // Persistent History
  const [history, setHistory] = useState<SessionRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const prevTypedRef = useRef<string>('');
  const feedbackSeqRef = useRef<number>(0);

  const activeLesson = useMemo(
    () => LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0],
    [activeLessonId]
  );

  // Compute current target text
  const targetText = useMemo(() => {
    if (mode === PracticeMode.Lesson) {
      return activeLesson.exercises[exerciseIdx % activeLesson.exercises.length];
    }
    if (mode === PracticeMode.TimedTest) {
      const list = TIMED_PASSAGES[timedLang];
      return list[timedPassageIdx % list.length];
    }
    return appliedCustomText.trim() || DEFAULT_CUSTOM_TEXT;
  }, [mode, activeLesson, exerciseIdx, timedLang, timedPassageIdx, appliedCustomText]);

  const sessionTitle = useMemo(() => {
    if (mode === PracticeMode.Lesson) {
      return `Bài ${activeLesson.number}: ${activeLesson.title} (Phần ${exerciseIdx + 1}/${activeLesson.exercises.length})`;
    }
    if (mode === PracticeMode.TimedTest) {
      const langLabel =
        timedLang === 'vi'
          ? 'Tiếng Việt có dấu'
          : timedLang === 'viNoTone'
            ? 'Tiếng Việt không dấu'
            : 'Tiếng Anh';
      return `Kiểm tra tốc độ ${timedDuration} giây — ${langLabel}`;
    }
    return 'Văn bản tự chọn cá nhân';
  }, [mode, activeLesson, exerciseIdx, timedDuration, timedLang]);

  const saveSessionRecord = useCallback((record: SessionRecord) => {
    setLastRecord(record);
    setHistory((prev) => {
      const updated = [record, ...prev].slice(0, 60);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  }, []);

  const resetSession = useCallback((autoFocus = true) => {
    setTypedText('');
    prevTypedRef.current = '';
    setStartTimeMs(null);
    setElapsedSec(0);
    setIsFinished(false);
    setErrorCount(0);
    setMissedChars({});
    setLastRecord(null);
    setKeyFeedback(null);
    if (autoFocus) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, []);

  // Finalize session helper
  const finishSession = useCallback(
    (finalTyped: string, finalDurationSec: number, finalErrors: number, finalMissed: Record<string, number>) => {
      if (isFinished) return;
      setIsFinished(true);

      const safeSec = Math.max(1, finalDurationSec);
      const minutes = safeSec / 60;

      let correctChars = 0;
      for (let i = 0; i < finalTyped.length; i++) {
        if (finalTyped[i] === targetText[i]) {
          correctChars++;
        }
      }

      const netWpm = Math.max(0, Math.round(correctChars / 5 / minutes));
      const rawWpm = Math.max(0, Math.round(finalTyped.length / 5 / minutes));
      const totalKeystrokes = finalTyped.length + finalErrors;
      const accuracy =
        totalKeystrokes > 0
          ? Math.max(0, Math.min(100, Math.round(((totalKeystrokes - finalErrors) / totalKeystrokes) * 100)))
          : 100;

      if (soundEnabled) {
        soundEngine.playSuccessChime();
      }

      const record: SessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        mode,
        lessonId: mode === PracticeMode.Lesson ? activeLesson.id : undefined,
        title: sessionTitle,
        wpm: netWpm,
        rawWpm,
        accuracy,
        durationSec: Math.round(safeSec),
        totalChars: finalTyped.length,
        errorCount: finalErrors,
        missedChars: finalMissed,
      };

      saveSessionRecord(record);
    },
    [isFinished, targetText, soundEnabled, mode, activeLesson.id, sessionTitle, saveSessionRecord]
  );

  // Timer tick while typing
  useEffect(() => {
    if (!startTimeMs || isFinished) return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - startTimeMs) / 1000);
      setElapsedSec(sec);

      if (mode === PracticeMode.TimedTest && sec >= timedDuration) {
        window.clearInterval(interval);
        finishSession(prevTypedRef.current, timedDuration, errorCount, missedChars);
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [startTimeMs, isFinished, mode, timedDuration, finishSession, errorCount, missedChars]);

  // Global physical keyboard listener for visual key highlight & Esc reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetSession(true);
        return;
      }

      setPressedCodes((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      // Auto-focus typing textarea if user presses printable key while not editing custom draft
      if (
        !isEditingCustom &&
        !isFinished &&
        document.activeElement !== inputRef.current &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        inputRef.current?.focus();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedCodes((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    const handleBlur = () => {
      setPressedCodes(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isEditingCustom, isFinished, resetSession]);

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle text input (supports full Vietnamese Telex / VNI IME composition cleanly)
  const handleInputChange = (rawVal: string) => {
    if (isFinished) return;

    // Normalize NFC so Vietnamese composed characters always match targetText
    const nextVal = rawVal.normalize('NFC').slice(0, targetText.length);
    const prevVal = prevTypedRef.current;

    let currentStart = startTimeMs;
    if (!currentStart && nextVal.length > 0) {
      currentStart = Date.now();
      setStartTimeMs(currentStart);
    }

    let nextErrors = errorCount;
    const nextMissed = { ...missedChars };

    if (nextVal.length >= prevVal.length && nextVal !== prevVal) {
      const idx = nextVal.length - 1;
      if (idx >= 0 && idx < targetText.length) {
        const typedCh = nextVal[idx];
        const expectedCh = targetText[idx];
        const typedKeyGuide = getGuidanceForChar(typedCh);
        const expectedKeyGuide = getGuidanceForChar(expectedCh);

        if (typedCh === expectedCh) {
          const hitCode = expectedKeyGuide.primaryKey?.code || typedKeyGuide.primaryKey?.code;
          if (hitCode) {
            feedbackSeqRef.current += 1;
            setKeyFeedback({
              code: hitCode,
              shiftCode: expectedKeyGuide.shiftCode,
              outcome: 'correct',
              seq: feedbackSeqRef.current,
            });
          }
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(8);
          }
          if (soundEnabled) {
            soundEngine.playKeyClick(expectedCh === ' ');
          }
        } else {
          // Only penalize if it is not a transient base vowel about to receive a Vietnamese tone mark
          const expectedBase = expectedCh
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace('đ', 'd')
            .replace('Đ', 'D');
          const isIntermediateVietnameseChar =
            typedCh.toLowerCase() === expectedBase.toLowerCase() && typedCh !== expectedCh;

          if (isIntermediateVietnameseChar) {
            const baseHitCode = typedKeyGuide.primaryKey?.code || expectedKeyGuide.primaryKey?.code;
            if (baseHitCode) {
              feedbackSeqRef.current += 1;
              setKeyFeedback({
                code: baseHitCode,
                shiftCode: typedKeyGuide.shiftCode,
                outcome: 'correct',
                seq: feedbackSeqRef.current,
              });
            }
            if (soundEnabled) {
              soundEngine.playKeyClick(false);
            }
          } else {
            nextErrors += 1;
            nextMissed[expectedCh] = (nextMissed[expectedCh] || 0) + 1;
            setErrorCount(nextErrors);
            setMissedChars(nextMissed);

            const errCode = typedKeyGuide.primaryKey?.code || expectedKeyGuide.primaryKey?.code;
            if (errCode) {
              feedbackSeqRef.current += 1;
              setKeyFeedback({
                code: errCode,
                outcome: 'error',
                seq: feedbackSeqRef.current,
              });
            }
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
              navigator.vibrate([15, 25, 15]);
            }
            if (errorSoundEnabled) {
              soundEngine.playErrorSound();
            }
          }
        }
      }
    }

    prevTypedRef.current = nextVal;
    setTypedText(nextVal);

    // Check if user reached the end of targetText
    if (nextVal.length === targetText.length) {
      const lastMatches = nextVal[nextVal.length - 1] === targetText[targetText.length - 1];
      // Allow completing immediately when last character matches or is non-accented
      if (lastMatches || nextVal.length === targetText.length) {
        const durationSec = currentStart ? (Date.now() - currentStart) / 1000 : 1;
        finishSession(nextVal, durationSec, nextErrors, nextMissed);
      }
    }
  };

  // Live WPM & Accuracy calculation
  const liveStats = useMemo(() => {
    if (!startTimeMs || typedText.length === 0) {
      return { wpm: 0, accuracy: 100 };
    }
    const elapsedMinutes = Math.max(1, elapsedSec || 1) / 60;
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetText[i]) correct++;
    }
    const wpm = Math.max(0, Math.round(correct / 5 / elapsedMinutes));
    const totalAttempts = typedText.length + errorCount;
    const accuracy =
      totalAttempts > 0
        ? Math.max(0, Math.min(100, Math.round(((totalAttempts - errorCount) / totalAttempts) * 100)))
        : 100;
    return { wpm, accuracy };
  }, [startTimeMs, typedText, elapsedSec, targetText, errorCount]);

  // Active finger & key guidance for the current character
  const nextChar = !isFinished && typedText.length < targetText.length ? targetText[typedText.length] : '';
  const guidance = useMemo(() => getGuidanceForChar(nextChar), [nextChar]);

  const countdownSec =
    mode === PracticeMode.TimedTest
      ? Math.max(0, timedDuration - elapsedSec)
      : null;

  // Navigation & Action Handlers
  const handleSelectLesson = (lesson: Lesson) => {
    setMode(PracticeMode.Lesson);
    setActiveLessonId(lesson.id);
    setExerciseIdx(0);
    setIsEditingCustom(false);
    setTypedText('');
    prevTypedRef.current = '';
    setStartTimeMs(null);
    setElapsedSec(0);
    setIsFinished(false);
    setErrorCount(0);
    setMissedChars({});
    setLastRecord(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus(), 250);
  };

  const handleNextExercise = () => {
    if (mode === PracticeMode.Lesson) {
      if (exerciseIdx + 1 < activeLesson.exercises.length) {
        setExerciseIdx((i) => i + 1);
      } else {
        const currentLessonIndex = LESSONS.findIndex((l) => l.id === activeLesson.id);
        const nextLesson = LESSONS[(currentLessonIndex + 1) % LESSONS.length];
        setActiveLessonId(nextLesson.id);
        setExerciseIdx(0);
      }
    } else if (mode === PracticeMode.TimedTest) {
      setTimedPassageIdx((i) => i + 1);
    }
    resetSession(true);
  };

  const handleSwitchMode = (nextMode: PracticeMode) => {
    setMode(nextMode);
    setIsEditingCustom(nextMode === PracticeMode.CustomText && !appliedCustomText);
    resetSession(nextMode !== PracticeMode.CustomText);
  };

  const handleApplyCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customDraft.replace(/\s+/g, ' ').trim();
    if (cleaned.length >= 10) {
      setAppliedCustomText(cleaned);
      setIsEditingCustom(false);
      resetSession(true);
    }
  };

  const scrollToWorkspace = () => {
    setActiveSection('san-tap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleNavigateSection = (section: ActiveNavSection) => {
    setActiveSection(section);
    if (section === 'san-tap') {
      setMode(PracticeMode.Lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }
    const targetEl = document.getElementById(section);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bestWpm = useMemo(
    () => (history.length > 0 ? Math.max(...history.map((h) => h.wpm)) : 0),
    [history]
  );

  // Sync active section highlight on scroll
  useEffect(() => {
    const sections: ActiveNavSection[] = ['san-tap', 'lo-trinh', 'nguyen-tac', 'thong-ke'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 md:pl-[72px] pb-14 md:pb-0 flex flex-col">
      {/* Fixed Left Vertical Dark Icon Sidebar Rail (matching reference image) */}
      <SidebarRail
        activeSection={activeSection}
        mode={mode}
        soundEnabled={soundEnabled}
        errorSoundEnabled={errorSoundEnabled}
        showFingerZones={showFingerZones}
        showHandSvg={showHandSvg}
        bestWpm={bestWpm}
        totalSessions={history.length}
        onNavigateSection={handleNavigateSection}
        onStartTimedTest={() => {
          handleSwitchMode(PracticeMode.TimedTest);
          scrollToWorkspace();
        }}
        onOpenCustomText={() => {
          setMode(PracticeMode.CustomText);
          setIsEditingCustom(true);
          resetSession(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectLesson={handleSelectLesson}
        onResetSession={() => resetSession(true)}
        onToggleSound={() => {
          setSoundEnabled((prev) => {
            const next = !prev;
            if (next) soundEngine.playKeyClick(false);
            return next;
          });
        }}
        onToggleErrorSound={() => {
          setErrorSoundEnabled((prev) => {
            const next = !prev;
            if (next) soundEngine.playErrorSound();
            return next;
          });
        }}
        onToggleZones={() => setShowFingerZones((z) => !z)}
        onToggleHands={() => setShowHandSvg((h) => !h)}
      />

      {/* Main Interactive Touch-Typing Sandbox */}
      <main id="san-tap" className="flex-1">
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            {/* Compact Workspace Header & Mode Segmented Controls */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Luyện gõ mười ngón tay</span>
                  <span aria-hidden="true">·</span>
                  <span>Hỗ trợ Tiếng Việt Telex / VNI & Tiếng Anh</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
                  {sessionTitle}
                </h1>
              </div>

              {/* Functional Mode Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(PracticeMode.Lesson)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      mode === PracticeMode.Lesson
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bài học 10 ngón
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(PracticeMode.TimedTest)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      mode === PracticeMode.TimedTest
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kiểm tra tốc độ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(PracticeMode.CustomText)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      mode === PracticeMode.CustomText
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Văn bản tự chọn
                  </button>
                </div>

                {/* Contextual Sub-controls per Mode */}
                {mode === PracticeMode.Lesson && (
                  <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                    {activeLesson.exercises.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setExerciseIdx(idx);
                          resetSession(true);
                        }}
                        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          exerciseIdx === idx
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Phần {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {mode === PracticeMode.TimedTest && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                      {([30, 60, 120] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setTimedDuration(sec);
                            resetSession(true);
                          }}
                          className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            timedDuration === sec
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setTimedLang('vi');
                          setTimedPassageIdx(0);
                          resetSession(true);
                        }}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          timedLang === 'vi'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tiếng Việt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTimedLang('viNoTone');
                          setTimedPassageIdx(0);
                          resetSession(true);
                        }}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          timedLang === 'viNoTone'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Không dấu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTimedLang('en');
                          setTimedPassageIdx(0);
                          resetSession(true);
                        }}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          timedLang === 'en'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                )}

                {mode === PracticeMode.CustomText && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom((v) => !v)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isEditingCustom ? 'Đóng khung soạn' : 'Đổi đoạn văn bản'}
                  </button>
                )}
              </div>
            </div>

            {/* Custom Text Editor Drawer */}
            {mode === PracticeMode.CustomText && isEditingCustom && (
              <form
                onSubmit={handleApplyCustomText}
                className="rounded-xl bg-white border border-slate-200 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-text-editor" className="text-sm font-semibold text-slate-900">
                    Nhập đoạn văn bản bạn muốn luyện gõ (tối thiểu 10 ký tự)
                  </label>
                  <span className="text-xs font-mono text-slate-500">
                    {customDraft.trim().length} ký tự
                  </span>
                </div>
                <textarea
                  id="custom-text-editor"
                  rows={3}
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  placeholder="Dán nội dung tài liệu, bài báo hoặc đoạn code vào đây..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-sky-600"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={customDraft.trim().length < 10}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Áp dụng và bắt đầu gõ
                  </button>
                </div>
              </form>
            )}

            {/* Focal Anchor: Typing Stage OR Session Summary */}
            {isFinished && lastRecord ? (
              <SessionSummary
                record={lastRecord}
                targetWpm={mode === PracticeMode.Lesson ? activeLesson.targetWpm : 40}
                targetAccuracy={mode === PracticeMode.Lesson ? activeLesson.targetAccuracy : 94}
                hasNextExercise={mode !== PracticeMode.CustomText}
                onRetry={() => resetSession(true)}
                onNext={handleNextExercise}
              />
            ) : (
              <div className="space-y-6">
                <TypingCanvas
                  targetText={targetText}
                  typedText={typedText}
                  isFocused={isFocused}
                  isFinished={isFinished}
                  wpm={liveStats.wpm}
                  accuracy={liveStats.accuracy}
                  elapsedSec={elapsedSec}
                  countdownSec={countdownSec}
                  errorCount={errorCount}
                  soundEnabled={soundEnabled}
                  errorSoundEnabled={errorSoundEnabled}
                  showFingerZones={showFingerZones}
                  showHandSvg={showHandSvg}
                  onInputChange={handleInputChange}
                  onFocusChange={setIsFocused}
                  onReset={() => resetSession(true)}
                  onToggleSound={() => {
                    setSoundEnabled((prev) => {
                      const next = !prev;
                      if (next) soundEngine.playKeyClick(false);
                      return next;
                    });
                  }}
                  onToggleErrorSound={() => {
                    setErrorSoundEnabled((prev) => {
                      const next = !prev;
                      if (next) soundEngine.playErrorSound();
                      return next;
                    });
                  }}
                  onToggleZones={() => setShowFingerZones((z) => !z)}
                  onToggleHands={() => setShowHandSvg((h) => !h)}
                  inputRef={inputRef}
                />

                <VirtualKeyboard
                  guidance={guidance}
                  pressedCodes={pressedCodes}
                  keyFeedback={keyFeedback}
                  showFingerZones={showFingerZones}
                  showHandSvg={showHandSvg}
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 2: 14-Lesson Progressive Curriculum */}
        <CurriculumSection
          activeLessonId={activeLessonId}
          history={history}
          onSelectLesson={handleSelectLesson}
        />

        {/* Section 3: Ergonomic 10-Finger Principles & Allocation Table */}
        <FingerGuideSection />

        {/* Section 4: Personal Progress Analytics & Problem Keys */}
        <StatsSection
          history={history}
          onClearHistory={() => {
            setHistory([]);
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // ignore
            }
          }}
        />
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 Mười Ngón — Nền tảng luyện gõ bàn phím bằng 10 ngón tay chuẩn công thái học.
          </p>
          <div className="flex items-center gap-5">
            <a href="#san-tap" className="hover:text-slate-900 transition-colors">
              Sân tập
            </a>
            <a href="#lo-trinh" className="hover:text-slate-900 transition-colors">
              Lộ trình 14 bài
            </a>
            <a href="#nguyen-tac" className="hover:text-slate-900 transition-colors">
              Quy tắc đặt tay
            </a>
            <a href="#thong-ke" className="hover:text-slate-900 transition-colors">
              Thống kê WPM
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
