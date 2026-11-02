import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ListMusic,
  Languages,
  Keyboard,
  SlidersHorizontal,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { SUBTITLE_TRACKS, SubtitleTrack } from '../data/subtitleTracksData';
import { SessionRecord } from '../types';
import { soundEngine } from '../utils/sound';

interface BilingualSubtitleStageProps {
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  onExit: () => void;
  onSaveRecord: (record: SessionRecord) => void;
  onEditingCustomChange: (editing: boolean) => void;
}

type CharStatus = 'untyped' | 'correct' | 'retried' | 'error';

export const BilingualSubtitleStage: React.FC<BilingualSubtitleStageProps> = ({
  soundEnabled,
  errorSoundEnabled,
  onExit,
  onSaveRecord,
  onEditingCustomChange,
}) => {
  // Custom user tracks stored in localStorage
  const [customTracks, setCustomTracks] = useState<SubtitleTrack[]>(() => {
    try {
      const saved = localStorage.getItem('muoingon_subtitle_tracks_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const allTracks = useMemo(
    () => [...SUBTITLE_TRACKS, ...customTracks],
    [customTracks]
  );

  const [selectedTrackId, setSelectedTrackId] = useState<string>(SUBTITLE_TRACKS[0].id);
  const [lineIndex, setLineIndex] = useState<number>(0);

  // Per-line typing states
  const [lineTyped, setLineTyped] = useState<string>('');
  // Tracks indices in current line that ever had a mistake -> colored amber/orange when fixed!
  const [everWrongIndices, setEverWrongIndices] = useState<Set<number>>(new Set());

  // Track-wide cumulative WPM & Accuracy metrics
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [totalTypedChars, setTotalTypedChars] = useState<number>(0);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [missedMap, setMissedMap] = useState<Record<string, number>>({});

  // Interactive toolbar options (matching bottom floating pill bar in screenshot)
  const [isAutoPlaySpeech, setIsAutoPlaySpeech] = useState<boolean>(false);
  const [typingStrictness, setTypingStrictness] = useState<'standard' | 'relaxed'>('standard');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [fontScale, setFontScale] = useState<'md' | 'lg' | 'xl'>('lg');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showLineDrawer, setShowLineDrawer] = useState<boolean>(false);
  const [showBottomBar, setShowBottomBar] = useState<boolean>(true);

  // Dropdown popovers
  const [openTrackMenu, setOpenTrackMenu] = useState<boolean>(false);
  const [openStrictMenu, setOpenStrictMenu] = useState<boolean>(false);
  const [openCustomModal, setOpenCustomModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customLinesRaw, setCustomLinesRaw] = useState<string>(
    'Mà tình yêu vẫn ở đây thôi. | Yet love is right here all along.\nGiữ lại bình yên trong từng phút giây. | Keeping serenity alive inside every passing moment.'
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevLineTypedRef = useRef<string>('');

  const activeTrack = useMemo(
    () => allTracks.find((t) => t.id === selectedTrackId) || allTracks[0],
    [allTracks, selectedTrackId]
  );

  const safeLineIdx = Math.min(lineIndex, Math.max(0, activeTrack.lines.length - 1));
  const currentLine = activeTrack.lines[safeLineIdx];
  const targetLineText = currentLine.text.normalize('NFC');

  // Lock page scroll while full-screen stage is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    onEditingCustomChange(openCustomModal);
  }, [openCustomModal, onEditingCustomChange]);

  // Cumulative timer
  useEffect(() => {
    if (!sessionStartMs) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.max(1, Math.floor((Date.now() - sessionStartMs) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [sessionStartMs]);

  // Optional Web Speech API pronunciation for current line when Play / Auto-Audio is active
  const speakLine = (textToSpeak: string, lang: 'vi' | 'en', rate: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      utter.rate = rate;
      utter.onend = () => {
        setIsAutoPlaySpeech(false);
      };
      setIsAutoPlaySpeech(true);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsAutoPlaySpeech(false);
    }
  };

  const resetCurrentLine = (focus = true) => {
    setLineTyped('');
    prevLineTypedRef.current = '';
    setEverWrongIndices(new Set());
    if (focus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const resetEntireTrack = () => {
    setLineIndex(0);
    setSessionStartMs(null);
    setElapsedSec(0);
    setTotalTypedChars(0);
    setTotalErrors(0);
    setMissedMap({});
    resetCurrentLine(true);
  };

  const goToLine = (idx: number) => {
    const clamped = Math.max(0, Math.min(activeTrack.lines.length - 1, idx));
    setLineIndex(clamped);
    resetCurrentLine(true);
  };

  // Character matching supporting Standard vs Relaxed (case/punctuation forgiving) modes
  const charsMatch = (typedCh: string, expectedCh: string): boolean => {
    if (typedCh === expectedCh) return true;
    if (typingStrictness === 'relaxed') {
      return typedCh.toLowerCase() === expectedCh.toLowerCase();
    }
    return false;
  };

  const handleLineInputChange = (rawVal: string) => {
    const normalized = rawVal.normalize('NFC').slice(0, targetLineText.length);
    const prev = prevLineTypedRef.current;

    if (!sessionStartMs && normalized.length > 0) {
      setSessionStartMs(Date.now());
    }

    let updatedErrors = totalErrors;
    const updatedMissed = { ...missedMap };
    const nextEverWrong = new Set(everWrongIndices);

    if (normalized.length >= prev.length && normalized !== prev) {
      const idx = normalized.length - 1;
      if (idx >= 0 && idx < targetLineText.length) {
        const typedCh = normalized[idx];
        const expectedCh = targetLineText[idx];

        if (charsMatch(typedCh, expectedCh)) {
          setTotalTypedChars((c) => c + 1);
          if (soundEnabled) {
            soundEngine.playKeyClick(expectedCh === ' ');
          }
        } else {
          // Check intermediate Vietnamese vowel before tone mark (e.g. 'o' -> 'ô' -> 'ổ')
          const expectedBase = expectedCh
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace('đ', 'd')
            .replace('Đ', 'D');
          const isIntermediateTone =
            typedCh.toLowerCase() === expectedBase.toLowerCase() && typedCh !== expectedCh;

          if (isIntermediateTone) {
            if (soundEnabled) {
              soundEngine.playKeyClick(false);
            }
          } else {
            nextEverWrong.add(idx);
            setEverWrongIndices(nextEverWrong);
            updatedErrors += 1;
            updatedMissed[expectedCh] = (updatedMissed[expectedCh] || 0) + 1;
            setTotalErrors(updatedErrors);
            setMissedMap(updatedMissed);
            if (errorSoundEnabled) {
              soundEngine.playErrorSound();
            }
          }
        }
      }
    }

    prevLineTypedRef.current = normalized;
    setLineTyped(normalized);

    // Check if entire line is completed accurately
    if (normalized.length === targetLineText.length) {
      const allMatched = Array.from(targetLineText).every((expCh, i) =>
        charsMatch(normalized[i] || '', expCh)
      );

      if (allMatched) {
        if (safeLineIdx + 1 < activeTrack.lines.length) {
          // Brief pause so user sees the completed teal/amber line before advancing
          window.setTimeout(() => {
            setLineIndex((curr) => Math.min(activeTrack.lines.length - 1, curr + 1));
            resetCurrentLine(true);
          }, 180);
        } else {
          // Completed final line of track -> Save record & chime!
          if (soundEnabled) {
            soundEngine.playSuccessChime();
          }
          const dur = Math.max(1, sessionStartMs ? Math.round((Date.now() - sessionStartMs) / 1000) : 1);
          const mins = dur / 60;
          const totalCharsDone = totalTypedChars + 1;
          const calcWpm = Math.max(1, Math.round(totalCharsDone / 5 / mins));
          const attempts = totalCharsDone + updatedErrors;
          const calcAcc =
            attempts > 0
              ? Math.max(0, Math.min(100, Math.round(((attempts - updatedErrors) / attempts) * 100)))
              : 100;

          onSaveRecord({
            id: `${Date.now()}-sub`,
            timestamp: Date.now(),
            mode: 'subtitle_line' as SessionRecord['mode'],
            title: `Video Phụ đề: ${activeTrack.title}`,
            wpm: calcWpm,
            rawWpm: calcWpm,
            accuracy: calcAcc,
            durationSec: dur,
            totalChars: totalCharsDone,
            errorCount: updatedErrors,
            missedChars: updatedMissed,
          });
        }
      }
    }
  };

  // Compute live WPM & Accuracy (matching top header LINE / WPM / ACCURACY)
  const liveMetrics = useMemo(() => {
    if (!sessionStartMs || totalTypedChars === 0) {
      return { wpm: 0, accuracy: 100 };
    }
    const mins = Math.max(1, elapsedSec) / 60;
    const wpm = Math.max(0, Math.round(totalTypedChars / 5 / mins));
    const attempts = totalTypedChars + totalErrors;
    const accuracy =
      attempts > 0
        ? Math.max(0, Math.min(100, Math.round(((attempts - totalErrors) / attempts) * 100)))
        : 100;
    return { wpm, accuracy };
  }, [sessionStartMs, totalTypedChars, elapsedSec, totalErrors]);

  // Extract only the current word being typed at the end for the centered floating pill preview
  const currentWordPreview = useMemo(() => {
    if (!lineTyped) return '';
    const parts = lineTyped.split(' ');
    return parts[parts.length - 1];
  }, [lineTyped]);

  const formatMmSs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Interpolate track timeline progress
  const currentTimestampSec = useMemo(() => {
    const baseSec = currentLine.timestampSec;
    const prevSec = safeLineIdx > 0 ? activeTrack.lines[safeLineIdx - 1].timestampSec : 0;
    const charRatio =
      targetLineText.length > 0 ? lineTyped.length / targetLineText.length : 0;
    return Math.min(
      activeTrack.totalDurationSec,
      Math.round(prevSec + (baseSec - prevSec) * charRatio)
    );
  }, [currentLine, safeLineIdx, activeTrack, lineTyped.length, targetLineText.length]);

  const timelinePct = Math.min(
    100,
    Math.max(
      4,
      Math.round(
        (((safeLineIdx + (targetLineText.length ? lineTyped.length / targetLineText.length : 0)) /
          activeTrack.lines.length) *
          100)
      )
    )
  );

  const handleSaveCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLines = customLinesRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((row, idx) => {
        const [mainPart, transPart] = row.split('|').map((s) => s.trim());
        return {
          text: mainPart || row,
          translation: transPart || '',
          timestampSec: (idx + 1) * 22,
        };
      })
      .filter((item) => item.text.length >= 2);

    if (parsedLines.length === 0) return;

    const newTrack: SubtitleTrack = {
      id: `custom-track-${Date.now()}`,
      title: customTitle.trim() || `Bài phụ đề tự tạo #${customTracks.length + 1}`,
      artist: 'Tùy chọn cá nhân',
      totalDurationSec: parsedLines.length * 22 + 10,
      primaryLang: 'vi',
      lines: parsedLines,
    };

    const nextCustom = [newTrack, ...customTracks];
    setCustomTracks(nextCustom);
    try {
      localStorage.setItem('muoingon_subtitle_tracks_v1', JSON.stringify(nextCustom));
    } catch {
      // ignore
    }
    setSelectedTrackId(newTrack.id);
    setLineIndex(0);
    resetCurrentLine(true);
    setOpenCustomModal(false);
  };

  const headlineSizeClass =
    fontScale === 'md'
      ? 'text-3xl sm:text-5xl'
      : fontScale === 'xl'
        ? 'text-4xl sm:text-6xl md:text-[68px]'
        : 'text-4xl sm:text-5xl md:text-[58px]';

  return (
    <div
      onClick={() => {
        setOpenTrackMenu(false);
        setOpenStrictMenu(false);
        if (!openCustomModal) {
          inputRef.current?.focus();
        }
      }}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#FAFAFA] text-slate-800 flex flex-col justify-between px-6 sm:px-12 py-7 select-none overflow-hidden"
    >
      {/* Top Left Back Button */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-6 left-6 z-20 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về sân tập</span>
        </button>
      </div>

      {/* TOP SECTION: LINE / WPM / ACCURACY + Playback Controls + Progress Timeline (matching screenshot) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-5 pt-2"
      >
        {/* 3 Clean Uppercase KPI Columns */}
        <div className="flex items-center justify-center gap-10 sm:gap-14 text-center">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">LINE</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-0.5">
              {safeLineIdx + 1}/{activeTrack.lines.length}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">WPM</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-0.5">
              {liveMetrics.wpm}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">ACCURACY</p>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-0.5">
              {liveMetrics.accuracy}%
            </p>
          </div>
        </div>

        {/* 5 Rounded Square Transport Controls: < | Play | Replay | > | Lines */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={safeLineIdx === 0}
            onClick={() => goToLine(safeLineIdx - 1)}
            title="Câu trước"
            className="w-10 h-9 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 shadow-2xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAutoPlaySpeech && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsAutoPlaySpeech(false);
              } else {
                speakLine(targetLineText, activeTrack.primaryLang, speechRate);
              }
              inputRef.current?.focus();
            }}
            title="Nghe phát âm câu hiện tại"
            className="w-10 h-9 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
          >
            {isAutoPlaySpeech ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => resetCurrentLine(true)}
            title="Gõ lại câu này"
            className="w-10 h-9 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={safeLineIdx >= activeTrack.lines.length - 1}
            onClick={() => goToLine(safeLineIdx + 1)}
            title="Câu tiếp theo"
            className="w-10 h-9 rounded-lg bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-35 shadow-2xs transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowLineDrawer((v) => !v)}
            title="Danh sách toàn bộ câu thoại"
            className={`w-10 h-9 rounded-lg border flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
              showLineDrawer
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>

        {/* Thin Cyan-Blue Timeline Progress Bar + Timestamp */}
        <div className="w-full max-w-lg flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4DA8DA] rounded-full transition-all duration-200"
              style={{ width: `${timelinePct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
            {formatMmSs(currentTimestampSec)} / {formatMmSs(activeTrack.totalDurationSec)}
          </span>
        </div>
      </div>

      {/* CENTER STAGE: Giant Color-Coded Sentence + Bilingual Subtitle + Centered Active-Word Input Box */}
      <div className="my-auto w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-12 px-2">
        {/* Giant Multi-Color Character Display:
            - Teal (#3BA99C): Typed accurately on 1st try
            - Warm Amber (#DF8A13): Had a previous slip on this index, now corrected
            - Coral Red (#E04F44): Currently wrong character
            - Highlighted Gray Block: Active cursor position */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`${headlineSizeClass} font-medium leading-[1.35] tracking-tight break-words max-w-5xl cursor-text`}
        >
          {Array.from(targetLineText).map((expectedChar, idx) => {
            const isTyped = idx < lineTyped.length;
            const isCurrent = idx === lineTyped.length;
            const actualChar = isTyped ? lineTyped[idx] : '';
            const matched = isTyped && charsMatch(actualChar, expectedChar);

            let status: CharStatus = 'untyped';
            if (isTyped) {
              if (!matched) {
                status = 'error';
              } else if (everWrongIndices.has(idx)) {
                status = 'retried';
              } else {
                status = 'correct';
              }
            }

            let colorClass = 'text-slate-400/75';
            if (status === 'correct') {
              colorClass = 'text-[#3BA99C]'; // Signature Mint-Teal from reference
            } else if (status === 'retried') {
              colorClass = 'text-[#DF8A13]'; // Signature Warm Amber from reference
            } else if (status === 'error') {
              colorClass = 'text-[#E04F44] underline decoration-[#E04F44]/60 underline-offset-8'; // Signature Coral Red
            }

            if (isCurrent) {
              colorClass = 'text-slate-900 bg-slate-200/90 rounded-md px-0.5';
            }

            return (
              <span key={idx} className={`transition-colors duration-100 ${colorClass}`}>
                {expectedChar}
              </span>
            );
          })}
        </div>

        {/* Bilingual Subtitle Translation + Centered Minimalist Word Input Pill */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-5">
          {showTranslation && currentLine.translation && (
            <p className="text-base sm:text-lg text-slate-600 font-normal tracking-normal">
              {currentLine.translation}
            </p>
          )}

          {/* Soft Rounded Pill Displaying Current Word with Underline & Real Input */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="relative w-full max-w-md h-12 rounded-xl bg-slate-100/90 border border-slate-200/70 flex items-center justify-center px-6 cursor-text focus-within:bg-white focus-within:border-sky-400 focus-within:shadow-xs transition-all"
          >
            {/* Visual centered current word with crisp bottom underline (matching screenshot) */}
            <div className="pointer-events-none flex items-center justify-center text-lg font-medium text-slate-800">
              {currentWordPreview ? (
                <span className="border-b-2 border-slate-700 pb-0.5">
                  {currentWordPreview}
                </span>
              ) : (
                <span className="text-sm text-slate-400">
                  Gõ theo câu trên...
                </span>
              )}
              <span className="w-[1.5px] h-5 bg-slate-700 ml-0.5 animate-pulse" />
            </div>

            {/* Real input capturing Vietnamese Telex/VNI IME seamlessly */}
            <input
              ref={inputRef}
              type="text"
              value={lineTyped}
              onChange={(e) => handleLineInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  resetCurrentLine(true);
                } else if (e.key === 'ArrowRight' && e.ctrlKey) {
                  e.preventDefault();
                  goToLine(safeLineIdx + 1);
                } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
                  e.preventDefault();
                  goToLine(safeLineIdx - 1);
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Ô nhập từng dòng phụ đề song ngữ"
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROL BAR (matching Select Video | Type | Translation | Aa | % | Settings) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col items-center justify-end z-20"
      >
        {showBottomBar ? (
          <div className="relative inline-flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-xs text-slate-600">
            {/* 1. Reset whole track */}
            <button
              type="button"
              onClick={resetEntireTrack}
              title="Bắt đầu lại từ câu 1"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* 2. Select Video / Track Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenTrackMenu((v) => !v);
                  setOpenStrictMenu(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[150px] truncate">{activeTrack.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {openTrackMenu && (
                <div className="absolute bottom-11 left-0 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-1 z-30 text-left">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>CHỌN BÀI PHỤ ĐỀ / VIDEO</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenTrackMenu(false);
                        setOpenCustomModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tự tạo mới</span>
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {allTracks.map((tr) => (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => {
                          setSelectedTrackId(tr.id);
                          setLineIndex(0);
                          setOpenTrackMenu(false);
                          resetCurrentLine(true);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          tr.id === activeTrack.id
                            ? 'bg-sky-50 text-sky-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <p className="text-xs truncate">{tr.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {tr.lines.length} câu · {tr.artist}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Type Strictness Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenStrictMenu((v) => !v);
                  setOpenTrackMenu(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 whitespace-nowrap cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                <span>{typingStrictness === 'standard' ? 'Gõ chuẩn' : 'Bỏ qua hoa/thường'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {openStrictMenu && (
                <div className="absolute bottom-11 left-0 w-52 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-30 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setTypingStrictness('standard');
                      setOpenStrictMenu(false);
                      inputRef.current?.focus();
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs text-left cursor-pointer ${
                      typingStrictness === 'standard'
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Gõ chuẩn (Chính xác hoa/dấu)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypingStrictness('relaxed');
                      setOpenStrictMenu(false);
                      inputRef.current?.focus();
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs text-left cursor-pointer ${
                      typingStrictness === 'relaxed'
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Thoải mái (Không phân biệt chữ hoa)
                  </button>
                </div>
              )}
            </div>

            {/* 4. Toggle Bilingual Translation (文A) */}
            <button
              type="button"
              onClick={() => {
                setShowTranslation((s) => !s);
                inputRef.current?.focus();
              }}
              title="Ẩn/hiện dòng dịch nghĩa song ngữ"
              className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border transition-colors cursor-pointer ${
                showTranslation
                  ? 'bg-sky-50 border-sky-200 text-sky-800 font-semibold'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
            </button>

            {/* 5. Font Size Cycle (Aa) */}
            <button
              type="button"
              onClick={() => {
                setFontScale((prev) => (prev === 'md' ? 'lg' : prev === 'lg' ? 'xl' : 'md'));
                inputRef.current?.focus();
              }}
              title="Đổi cỡ chữ câu chính (Vừa / Lớn / Cực lớn)"
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
            >
              <span>Aa</span>
              <span className="text-[10px] text-slate-400 uppercase">{fontScale}</span>
            </button>

            {/* 6. Speech Speed (%) */}
            <button
              type="button"
              onClick={() => {
                const next = speechRate === 1.0 ? 0.8 : speechRate === 0.8 ? 1.2 : 1.0;
                setSpeechRate(next);
                inputRef.current?.focus();
              }}
              title="Tốc độ đọc phát âm"
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 font-mono text-slate-700 cursor-pointer"
            >
              <span>{Math.round(speechRate * 100)}%</span>
            </button>

            {/* 7. Add Custom Bilingual Subtitle Modal Trigger */}
            <button
              type="button"
              onClick={() => setOpenCustomModal(true)}
              title="Tự nhập danh sách câu song ngữ mới"
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tự nhập câu</span>
            </button>

            {/* 8. Collapse Bottom Bar */}
            <button
              type="button"
              onClick={() => setShowBottomBar(false)}
              title="Thu gọn thanh công cụ dưới"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowBottomBar(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 hover:text-slate-800 shadow-2xs cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Mở thanh công cụ</span>
          </button>
        )}
      </div>

      {/* Slide-over All Lines List Drawer */}
      {showLineDrawer && (
        <div
          onClick={() => setShowLineDrawer(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeTrack.title}</h3>
                <p className="text-xs text-slate-500">Chọn dòng bất kỳ để nhảy tới luyện gõ</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLineDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {activeTrack.lines.map((ln, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    goToLine(idx);
                    setShowLineDrawer(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 transition-colors cursor-pointer ${
                    idx === safeLineIdx ? 'bg-sky-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                    <span>Dòng {idx + 1}/{activeTrack.lines.length}</span>
                    <span>{formatMmSs(ln.timestampSec)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{ln.text}</p>
                  {ln.translation && (
                    <p className="text-xs text-slate-500 mt-0.5">{ln.translation}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Bilingual Track Creator Modal */}
      {openCustomModal && (
        <div
          onClick={() => setOpenCustomModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCustomTrack}
            className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tạo bài gõ Phụ đề Song ngữ mới
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mỗi dòng là 1 câu. Dùng dấu gạch đứng <code className="font-mono text-slate-800">|</code> để ngăn cách câu chính và nghĩa dịch (không bắt buộc).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenCustomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tiêu đề bài / Video</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="VD: Lời bài hát / Hội thoại tiếng Anh..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Danh sách câu (Mỗi câu 1 dòng: Câu cần gõ | Nghĩa phụ đề)
              </label>
              <textarea
                rows={5}
                value={customLinesRaw}
                onChange={(e) => setCustomLinesRaw(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm font-mono text-slate-900 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setOpenCustomModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu & Bắt đầu luyện</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
