import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Palette,
  Sliders,
  Sparkles,
  Command,
  Search,
  Check,
  ArrowRight,
  Copy,
  ChevronDown,
  ArrowLeft,
  X,
  Keyboard,
  Clock,
  Hash,
  Quote,
  Flame,
  Globe,
  Share2,
} from 'lucide-react';
import {
  MonkeyThemeId,
  MonkeyThemeDef,
  MonkeyCaretStyle,
  MonkeySoundPack,
  MonkeyModeType,
  MonkeyLanguage,
  SessionRecord,
  PracticeMode,
} from '../types';
import { MONKEY_THEMES, generateMonkeyWords, VI_QUOTES } from '../data/monkeytypeData';
import { soundEngine } from '../utils/sound';

interface MonkeyTypeStageProps {
  onExit: () => void;
  onSaveRecord?: (record: SessionRecord) => void;
}

interface SecondPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

const THEME_STORAGE_KEY = 'muoingon_monkey_theme';
const CARET_STORAGE_KEY = 'muoingon_monkey_caret';
const SOUND_STORAGE_KEY = 'muoingon_monkey_sound';

export const MonkeyTypeStage: React.FC<MonkeyTypeStageProps> = ({ onExit, onSaveRecord }) => {
  // Config state
  const [themeId, setThemeId] = useState<MonkeyThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved && saved in MONKEY_THEMES ? (saved as MonkeyThemeId) : 'serika_dark';
  });

  const [caretStyle, setCaretStyle] = useState<MonkeyCaretStyle>(() => {
    const saved = localStorage.getItem(CARET_STORAGE_KEY);
    return saved ? (saved as MonkeyCaretStyle) : 'smooth';
  });

  const [soundPack, setSoundPack] = useState<MonkeySoundPack>(() => {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    return saved ? (saved as MonkeySoundPack) : 'thocky';
  });

  const [mode, setMode] = useState<MonkeyModeType>('time');
  const [timeSec, setTimeSec] = useState<number>(30);
  const [wordCount, setWordCount] = useState<number>(25);
  const [quoteLength, setQuoteLength] = useState<'short' | 'medium' | 'long' | 'all'>('medium');
  const [punctuation, setPunctuation] = useState<boolean>(false);
  const [numbers, setNumbers] = useState<boolean>(false);
  const [language, setLanguage] = useState<MonkeyLanguage>('vi_200');

  // Word list and typed state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [historyWords, setHistoryWords] = useState<{ typed: string; isCorrect: boolean }[]>([]);

  // Telemetry & timer
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [chartData, setChartData] = useState<SecondPoint[]>([]);

  // Modals & UI menus
  const [openCommandPalette, setOpenCommandPalette] = useState<boolean>(false);
  const [commandSearch, setCommandSearch] = useState<string>('');
  const [openThemeModal, setOpenThemeModal] = useState<boolean>(false);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [showConfigBar, setShowConfigBar] = useState<boolean>(true);
  const [activeWordOffsetTop, setActiveWordOffsetTop] = useState<number>(0);

  // References
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeCharSpanRef = useRef<HTMLSpanElement | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const secondTrackerRef = useRef<SecondPoint[]>([]);
  const lastSecondErrorsRef = useRef<number>(0);

  const theme: MonkeyThemeDef = MONKEY_THEMES[themeId] || MONKEY_THEMES.serika_dark;

  // Persist settings
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem(CARET_STORAGE_KEY, caretStyle);
  }, [caretStyle]);

  useEffect(() => {
    localStorage.setItem(SOUND_STORAGE_KEY, soundPack);
    if (soundPack === 'off') {
      soundEngine.setVolume(0);
    } else {
      soundEngine.setVolume(0.85);
      soundEngine.setSoundPack(soundPack);
    }
  }, [soundPack]);

  // Generate words on mode or option change
  const initializeTest = useCallback(
    (customWordList?: string[]) => {
      let newWords: string[];
      if (customWordList && customWordList.length > 0) {
        newWords = customWordList;
      } else {
        newWords = generateMonkeyWords({
          mode,
          timeSec,
          wordCount,
          quoteLength,
          punctuation,
          numbers,
          language,
        });
      }

      setWords(newWords);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setHistoryWords([]);
      setStartTimeMs(null);
      setElapsedSec(0);
      setIsFinished(false);
      setErrorCount(0);
      setTotalKeystrokes(0);
      setChartData([]);
      secondTrackerRef.current = [];
      lastSecondErrorsRef.current = 0;
      setCopiedResult(false);

      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [mode, timeSec, wordCount, quoteLength, punctuation, numbers, language]
  );

  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  // Timer & chart point sampler
  useEffect(() => {
    if (!startTimeMs || isFinished) return;

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const currentElapsed = Math.max(1, Math.floor((now - startTimeMs) / 1000));
      setElapsedSec(currentElapsed);

      // Snapshot for chart
      const charsTyped =
        historyWords.reduce((acc, w) => acc + w.typed.length + 1, 0) + currentInput.length;
      const currentNetWpm = Math.max(
        0,
        Math.round(((charsTyped - errorCount * 5) / 5) / (currentElapsed / 60))
      );
      const currentRawWpm = Math.max(0, Math.round((charsTyped / 5) / (currentElapsed / 60)));
      const secErrors = Math.max(0, errorCount - lastSecondErrorsRef.current);
      lastSecondErrorsRef.current = errorCount;

      secondTrackerRef.current.push({
        second: currentElapsed,
        wpm: currentNetWpm,
        rawWpm: currentRawWpm,
        errors: secErrors,
      });

      // Time mode expiration check
      if (mode === 'time' && currentElapsed >= timeSec) {
        finishTest();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [startTimeMs, isFinished, mode, timeSec, historyWords, currentInput.length, errorCount]);

  // Finish test callback
  const finishTest = useCallback(() => {
    setIsFinished(true);
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }
    soundEngine.playSuccessChime();

    setChartData([...secondTrackerRef.current]);

    // Save session record
    const finalElapsed = Math.max(1, elapsedSec || 1);
    const charsTyped =
      historyWords.reduce((acc, w) => acc + w.typed.length + 1, 0) + currentInput.length;
    const finalWpm = Math.max(0, Math.round(((charsTyped - errorCount * 5) / 5) / (finalElapsed / 60)));
    const finalRaw = Math.max(0, Math.round((charsTyped / 5) / (finalElapsed / 60)));
    const accuracy =
      totalKeystrokes > 0
        ? Math.max(0, Math.min(100, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)))
        : 100;

    const record: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      mode: PracticeMode.MonkeyType,
      title: `Monkey Type — ${mode === 'time' ? `${timeSec}s` : mode === 'words' ? `${wordCount} từ` : mode} (${language})`,
      wpm: finalWpm,
      rawWpm: finalRaw,
      accuracy,
      durationSec: finalElapsed,
      totalChars: charsTyped,
      errorCount,
      missedChars: {},
    };

    onSaveRecord?.(record);
  }, [elapsedSec, historyWords, currentInput, errorCount, totalKeystrokes, mode, timeSec, wordCount, language, onSaveRecord]);

  // Smooth multi-line scroll: track active word top
  useEffect(() => {
    if (activeCharSpanRef.current && wordsContainerRef.current) {
      const parent = wordsContainerRef.current;
      const el = activeCharSpanRef.current;
      const offsetTop = el.offsetTop;
      setActiveWordOffsetTop(offsetTop);

      // Keep active line roughly on 2nd row (offset ~36-40px)
      if (offsetTop > 72) {
        parent.scrollTo({
          top: offsetTop - 40,
          behavior: 'smooth',
        });
      } else {
        parent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentWordIndex, currentInput.length]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    // Start timer on first keystroke
    if (!startTimeMs && val.length > 0) {
      setStartTimeMs(Date.now());
      secondTrackerRef.current = [
        { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
      ];
    }

    setTotalKeystrokes((prev) => prev + 1);

    // Audio click
    if (soundPack !== 'off') {
      const isSpace = val.endsWith(' ');
      soundEngine.playKeyClick(isSpace);
    }

    const currentTargetWord = words[currentWordIndex] || '';

    // If space pressed -> commit current word and advance
    if (val.endsWith(' ')) {
      const typedWord = val.trim();
      const isCorrect = typedWord.normalize('NFC') === currentTargetWord.normalize('NFC');

      if (!isCorrect) {
        setErrorCount((prev) => prev + 1);
        if (soundPack !== 'off') {
          soundEngine.playErrorSound();
        }
      }

      const nextHistory = [...historyWords, { typed: typedWord, isCorrect }];
      setHistoryWords(nextHistory);
      setCurrentInput('');

      // Check if finished by words or quote
      const nextWordIdx = currentWordIndex + 1;
      if (
        (mode === 'words' && nextWordIdx >= wordCount) ||
        (mode === 'quote' && nextWordIdx >= words.length) ||
        nextWordIdx >= words.length
      ) {
        finishTest();
      } else {
        setCurrentWordIndex(nextWordIdx);
      }
      return;
    }

    // Normal character addition
    // Check if current prefix matches target word prefix
    const normalizedVal = val.normalize('NFC');
    const targetPrefix = currentTargetWord.slice(0, val.length).normalize('NFC');

    // If typed letter deviates from target
    if (val.length > 0 && !targetPrefix.startsWith(normalizedVal)) {
      setErrorCount((prev) => prev + 1);
      if (soundPack !== 'off') {
        soundEngine.playErrorSound();
      }
    }

    setCurrentInput(val);
  };

  // Keyboard shortcut listener (Tab for restart, Esc for command palette, Shift+Enter for Zen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === 'Escape' && !isFinished)) {
        e.preventDefault();
        setOpenCommandPalette((prev) => !prev);
        return;
      }

      // Quick restart test on Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        initializeTest();
        return;
      }

      // Shift+Enter to finish Zen mode
      if (mode === 'zen' && e.key === 'Enter' && e.shiftKey && !isFinished) {
        e.preventDefault();
        finishTest();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, mode, initializeTest, finishTest]);

  // Live metrics calculation
  const liveNetWpm = useMemo(() => {
    const sec = Math.max(1, elapsedSec);
    const charsTyped =
      historyWords.reduce((acc, w) => acc + w.typed.length + 1, 0) + currentInput.length;
    return Math.max(0, Math.round(((charsTyped - errorCount * 5) / 5) / (sec / 60)));
  }, [elapsedSec, historyWords, currentInput.length, errorCount]);

  const liveRawWpm = useMemo(() => {
    const sec = Math.max(1, elapsedSec);
    const charsTyped =
      historyWords.reduce((acc, w) => acc + w.typed.length + 1, 0) + currentInput.length;
    return Math.max(0, Math.round((charsTyped / 5) / (sec / 60)));
  }, [elapsedSec, historyWords, currentInput.length]);

  const liveAccuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    return Math.max(0, Math.min(100, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)));
  }, [totalKeystrokes, errorCount]);

  // Consistency calculation (% consistency across second-by-second WPM)
  const consistencyPct = useMemo(() => {
    if (chartData.length < 3) return 92;
    const wpmValues = chartData.map((p) => p.wpm).filter((w) => w > 0);
    if (wpmValues.length === 0) return 95;
    const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    const variance =
      wpmValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmValues.length;
    const stdDev = Math.sqrt(variance);
    const coeff = mean > 0 ? (stdDev / mean) * 100 : 0;
    return Math.max(45, Math.min(100, Math.round(100 - coeff)));
  }, [chartData]);

  // Practice missed words
  const practiceMissedWords = () => {
    const wrongWords = historyWords
      .filter((w) => !w.isCorrect)
      .map((w, idx) => words[idx])
      .filter(Boolean);

    if (wrongWords.length === 0) return;

    // Repeat wrong words to make a solid training set
    const repeated: string[] = [];
    while (repeated.length < Math.max(15, wrongWords.length * 2)) {
      repeated.push(...wrongWords);
    }
    initializeTest(repeated.slice(0, 25));
  };

  // Copy result
  const handleCopyResult = () => {
    const text = `Mười Ngón (Monkey Type) — ${liveNetWpm} WPM | ${liveAccuracy}% ACC | ${theme.name} | ${mode} ${mode === 'time' ? `${timeSec}s` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    });
  };

  // Filter commands for palette
  const commandList = [
    { label: 'Theme: Serika Dark (Vàng xám than)', action: () => setThemeId('serika_dark') },
    { label: 'Theme: Dracula (Tím huyền bí)', action: () => setThemeId('dracula') },
    { label: 'Theme: Nord (Xanh băng Bắc Âu)', action: () => setThemeId('nord') },
    { label: 'Theme: Carbon (Đen cam)', action: () => setThemeId('carbon') },
    { label: 'Theme: Matrix (Xanh lá hacker)', action: () => setThemeId('matrix') },
    { label: 'Theme: Chalk Paper (Giấy phấn sáng)', action: () => setThemeId('chalk') },
    { label: 'Theme: Sakura (Hồng anh đào)', action: () => setThemeId('sakura') },
    { label: 'Theme: Cyberpunk (Neon rực rỡ)', action: () => setThemeId('cyberpunk') },
    { label: 'Chế độ: Thời gian 15s', action: () => { setMode('time'); setTimeSec(15); } },
    { label: 'Chế độ: Thời gian 30s', action: () => { setMode('time'); setTimeSec(30); } },
    { label: 'Chế độ: Thời gian 60s', action: () => { setMode('time'); setTimeSec(60); } },
    { label: 'Chế độ: Thời gian 120s', action: () => { setMode('time'); setTimeSec(120); } },
    { label: 'Chế độ: Từ ngữ (10 từ)', action: () => { setMode('words'); setWordCount(10); } },
    { label: 'Chế độ: Từ ngữ (25 từ)', action: () => { setMode('words'); setWordCount(25); } },
    { label: 'Chế độ: Từ ngữ (50 từ)', action: () => { setMode('words'); setWordCount(50); } },
    { label: 'Chế độ: Từ ngữ (100 từ)', action: () => { setMode('words'); setWordCount(100); } },
    { label: 'Chế độ: Trích dẫn / Ca dao tục ngữ', action: () => setMode('quote') },
    { label: 'Chế độ: Zen (Gõ tự do không giới hạn)', action: () => setMode('zen') },
    { label: 'Ngôn ngữ: Tiếng Việt 200 từ thông dụng', action: () => setLanguage('vi_200') },
    { label: 'Ngôn ngữ: Tiếng Việt 1000 từ nâng cao', action: () => setLanguage('vi_1k') },
    { label: 'Ngôn ngữ: Ca dao tục ngữ Việt Nam', action: () => setLanguage('vi_cadao') },
    { label: 'Ngôn ngữ: English 200 common words', action: () => setLanguage('en_200') },
    { label: 'Ngôn ngữ: English 1000 common words', action: () => setLanguage('en_1k') },
    { label: 'Ngôn ngữ: Lập trình (JavaScript / Python)', action: () => setLanguage('code') },
    { label: 'Âm thanh switch: Thocky (Trầm ấm)', action: () => setSoundPack('thocky') },
    { label: 'Âm thanh switch: Clicky (Cherry MX Blue đanh giòn)', action: () => setSoundPack('clicky') },
    { label: 'Âm thanh switch: Creamy (NovelKeys Cream êm mượt)', action: () => setSoundPack('creamy') },
    { label: 'Âm thanh: Máy đánh chữ cơ (Typewriter)', action: () => setSoundPack('typewriter') },
    { label: 'Âm thanh: Tắt âm thanh', action: () => setSoundPack('off') },
    { label: 'Con trỏ: Smooth (Trượt mượt)', action: () => setCaretStyle('smooth') },
    { label: 'Con trỏ: Line (Vạch nhấp nháy)', action: () => setCaretStyle('line') },
    { label: 'Con trỏ: Block (Khối vuông)', action: () => setCaretStyle('block') },
    { label: 'Con trỏ: Underline (Gạch chân)', action: () => setCaretStyle('underline') },
  ];

  const filteredCommands = commandList.filter((cmd) =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: theme.bgColor,
        color: theme.textColor,
        fontFamily: "'JetBrains Mono', monospace",
      }}
      onClick={() => {
        if (!openCommandPalette && !openThemeModal) {
          inputRef.current?.focus();
        }
      }}
      className="fixed inset-0 z-50 w-screen h-screen flex flex-col justify-between px-6 sm:px-14 py-6 select-none overflow-hidden transition-colors duration-300"
    >
      {/* Top Header: Back button + Live mini stats + Palette / Command shortcuts */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-between z-20 pb-2"
      >
        {/* Back to Mười Ngón curriculum */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            style={{
              backgroundColor: `${theme.subColor}20`,
              color: theme.textColor,
              borderColor: `${theme.subColor}40`,
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về sân tập</span>
          </button>

          {/* Quick theme pill trigger */}
          <button
            type="button"
            onClick={() => setOpenThemeModal(true)}
            style={{
              color: theme.mainColor,
              backgroundColor: `${theme.mainColor}15`,
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{theme.name}</span>
          </button>
        </div>

        {/* Live Countdown / Count / Zen indicator */}
        <div className="flex items-center gap-5 text-sm font-semibold tabular-nums">
          {mode === 'time' && (
            <span style={{ color: theme.mainColor }} className="text-xl font-bold">
              {Math.max(0, timeSec - elapsedSec)}s
            </span>
          )}
          {mode === 'words' && (
            <span style={{ color: theme.mainColor }} className="text-lg">
              {currentWordIndex}/{wordCount}
            </span>
          )}
          {mode === 'zen' && (
            <span style={{ color: theme.mainColor }} className="text-sm font-medium flex items-center gap-1">
              <span>Zen mode</span>
              <span className="text-xs opacity-70">(Shift+Enter để xong)</span>
            </span>
          )}
        </div>

        {/* Command Palette shortcut button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenCommandPalette(true)}
            style={{
              backgroundColor: `${theme.subColor}20`,
              color: theme.subColor,
              borderColor: `${theme.subColor}30`,
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lệnh nhanh</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-black/20">Esc</kbd>
          </button>
        </div>
      </div>

      {/* FLOATING MONKEYTYPE CONFIG BAR (when test is NOT finished) */}
      {!isFinished && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl mx-auto flex flex-col items-center z-10"
        >
          <div
            style={{
              backgroundColor: `${theme.subColor}18`,
              borderColor: `${theme.subColor}30`,
            }}
            className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md"
          >
            {/* Punctuation & Numbers toggles */}
            <button
              type="button"
              onClick={() => {
                setPunctuation((v) => !v);
                initializeTest();
              }}
              style={{
                color: punctuation ? theme.mainColor : theme.subColor,
              }}
              className="px-2 py-1 rounded transition-colors cursor-pointer hover:opacity-100 flex items-center gap-1"
            >
              <span>@</span>
              <span>dấu câu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNumbers((v) => !v);
                initializeTest();
              }}
              style={{
                color: numbers ? theme.mainColor : theme.subColor,
              }}
              className="px-2 py-1 rounded transition-colors cursor-pointer hover:opacity-100 flex items-center gap-1"
            >
              <span>#</span>
              <span>chữ số</span>
            </button>

            <div style={{ backgroundColor: `${theme.subColor}30` }} className="w-px h-4 mx-1" />

            {/* Mode selection: time | words | quote | zen */}
            {(['time', 'words', 'quote', 'zen'] as MonkeyModeType[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  initializeTest();
                }}
                style={{
                  color: mode === m ? theme.mainColor : theme.subColor,
                }}
                className="px-2 py-1 rounded transition-colors cursor-pointer hover:opacity-100 capitalize"
              >
                {m === 'time'
                  ? 'thời gian'
                  : m === 'words'
                    ? 'từ ngữ'
                    : m === 'quote'
                      ? 'trích dẫn'
                      : 'zen'}
              </button>
            ))}

            <div style={{ backgroundColor: `${theme.subColor}30` }} className="w-px h-4 mx-1" />

            {/* Sub-options for current mode */}
            {mode === 'time' && (
              <div className="flex items-center gap-1">
                {[15, 30, 60, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setTimeSec(sec);
                      initializeTest();
                    }}
                    style={{
                      color: timeSec === sec ? theme.mainColor : theme.subColor,
                    }}
                    className="px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {sec}
                  </button>
                ))}
              </div>
            )}

            {mode === 'words' && (
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setWordCount(cnt);
                      initializeTest();
                    }}
                    style={{
                      color: wordCount === cnt ? theme.mainColor : theme.subColor,
                    }}
                    className="px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            )}

            {mode === 'quote' && (
              <div className="flex items-center gap-1">
                {(['short', 'medium', 'long', 'all'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      setQuoteLength(len);
                      initializeTest();
                    }}
                    style={{
                      color: quoteLength === len ? theme.mainColor : theme.subColor,
                    }}
                    className="px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {len === 'short'
                      ? 'ngắn'
                      : len === 'medium'
                        ? 'vừa'
                        : len === 'long'
                          ? 'dài'
                          : 'tất cả'}
                  </button>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: `${theme.subColor}30` }} className="w-px h-4 mx-1" />

            {/* Language Selector Dropdown */}
            <div className="relative group">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as MonkeyLanguage);
                  initializeTest();
                }}
                style={{
                  color: theme.mainColor,
                  backgroundColor: 'transparent',
                }}
                className="text-xs font-semibold pr-3 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="vi_200" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  Tiếng Việt 200
                </option>
                <option value="vi_1k" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  Tiếng Việt 1k
                </option>
                <option value="vi_cadao" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  Ca dao Việt Nam
                </option>
                <option value="en_200" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  English 200
                </option>
                <option value="en_1k" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  English 1k
                </option>
                <option value="code" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
                  Code / Lập trình
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Hidden real input for Vietnamese IME Telex/VNI accuracy */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onBlur={() => {
          // Keep input focused unless modal open
          if (!openCommandPalette && !openThemeModal && !isFinished) {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="sr-only opacity-0 absolute pointer-events-none"
      />

      {/* MAIN STAGE: LIVE TYPING OR MONKEYTYPE RESULT SCREEN */}
      {!isFinished ? (
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto relative">
          {/* Subtle Live WPM preview indicator above text */}
          <div className="h-8 flex items-center justify-between text-xs font-semibold px-2 mb-2">
            <span style={{ color: theme.subColor }}>
              {startTimeMs ? `${liveNetWpm} WPM` : 'Bắt đầu gõ phím để tính giờ...'}
            </span>
            {errorCount > 0 && (
              <span style={{ color: theme.errorColor }}>
                {errorCount} lỗi
              </span>
            )}
          </div>

          {/* Smooth 3-Line Words Container (Monkeytype signature presentation) */}
          <div
            ref={wordsContainerRef}
            className="w-full max-h-[140px] sm:max-h-[180px] overflow-hidden leading-relaxed text-2xl sm:text-3xl tracking-wide select-none flex flex-wrap gap-x-3 gap-y-2 relative transition-all duration-200"
          >
            {words.map((targetWord, wordIdx) => {
              const isPast = wordIdx < currentWordIndex;
              const isCurrent = wordIdx === currentWordIndex;
              const isFuture = wordIdx > currentWordIndex;

              // Past typed word
              if (isPast) {
                const pastItem = historyWords[wordIdx];
                const isCorrect = pastItem?.isCorrect;
                return (
                  <span
                    key={wordIdx}
                    style={{
                      color: isCorrect ? theme.textColor : theme.errorColor,
                      borderBottom: isCorrect ? 'none' : `2px solid ${theme.errorColor}`,
                    }}
                    className="inline-block transition-colors"
                  >
                    {pastItem ? pastItem.typed : targetWord}
                  </span>
                );
              }

              // Current active word with live character color coding & caret
              if (isCurrent) {
                const typed = currentInput;
                const chars = targetWord.split('');

                return (
                  <span
                    key={wordIdx}
                    ref={activeCharSpanRef}
                    className="inline-block relative whitespace-nowrap"
                  >
                    {chars.map((char, charIdx) => {
                      const typedChar = typed[charIdx];
                      const isCharTyped = typedChar !== undefined;
                      const isCharCorrect =
                        isCharTyped && typedChar.normalize('NFC') === char.normalize('NFC');
                      const isCurrentChar = charIdx === typed.length;

                      let charColor = theme.subColor;
                      if (isCharTyped) {
                        charColor = isCharCorrect ? theme.textColor : theme.errorColor;
                      }

                      return (
                        <span key={charIdx} className="relative inline-block">
                          {/* Caret rendering */}
                          {isCurrentChar && caretStyle !== 'off' && (
                            <span
                              style={{
                                backgroundColor:
                                  caretStyle === 'block'
                                    ? `${theme.mainColor}40`
                                    : caretStyle === 'line' || caretStyle === 'smooth'
                                      ? theme.mainColor
                                      : 'transparent',
                                borderColor: theme.mainColor,
                              }}
                              className={`absolute ${
                                caretStyle === 'block'
                                  ? 'inset-0 rounded-xs'
                                  : caretStyle === 'underline'
                                    ? 'bottom-0 left-0 right-0 h-0.5'
                                    : caretStyle === 'outline'
                                      ? 'inset-0 border-2 rounded-xs'
                                      : 'top-1 bottom-1 -left-[1px] w-[2.5px] rounded-full animate-pulse'
                              }`}
                            />
                          )}

                          <span style={{ color: charColor }}>{char}</span>
                        </span>
                      );
                    })}

                    {/* Extra characters typed past word length */}
                    {typed.length > chars.length &&
                      typed
                        .slice(chars.length)
                        .split('')
                        .map((extraChar, extraIdx) => (
                          <span
                            key={`extra-${extraIdx}`}
                            style={{
                              color: theme.errorExtraColor,
                              backgroundColor: `${theme.errorColor}18`,
                            }}
                            className="inline-block px-0.5 rounded-xs"
                          >
                            {extraChar}
                          </span>
                        ))}

                    {/* Caret at end of word if typed length >= word length */}
                    {typed.length >= chars.length && caretStyle !== 'off' && (
                      <span
                        style={{ backgroundColor: theme.mainColor }}
                        className="inline-block w-[2.5px] h-6 -mb-1 ml-0.5 rounded-full animate-pulse"
                      />
                    )}
                  </span>
                );
              }

              // Future untyped word
              return (
                <span
                  key={wordIdx}
                  style={{ color: theme.subColor }}
                  className="inline-block opacity-60"
                >
                  {targetWord}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        /* ICONIC MONKEYTYPE RESULT SCREEN & TIMELINE CHART */
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto space-y-7 animate-in fade-in duration-300">
          {/* Top Hero Stats: Massive WPM & ACC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end pb-4 border-b border-white/10">
            <div>
              <p style={{ color: theme.subColor }} className="text-sm font-semibold tracking-wider">
                wpm
              </p>
              <h1
                style={{ color: theme.mainColor }}
                className="text-6xl sm:text-8xl font-black font-mono tracking-tight leading-none"
              >
                {liveNetWpm}
              </h1>
            </div>

            <div>
              <p style={{ color: theme.subColor }} className="text-sm font-semibold tracking-wider">
                acc
              </p>
              <h2
                style={{ color: liveAccuracy >= 95 ? theme.mainColor : theme.textColor }}
                className="text-5xl sm:text-7xl font-bold font-mono tracking-tight leading-none"
              >
                {liveAccuracy}%
              </h2>
            </div>
          </div>

          {/* Interactive SVG WPM Progression Chart */}
          <div
            style={{
              backgroundColor: `${theme.subColor}15`,
              borderColor: `${theme.subColor}30`,
            }}
            className="w-full h-44 rounded-xl border p-4 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs" style={{ color: theme.subColor }}>
              <span>Tiến độ WPM theo giây</span>
              <span>Độ ổn định: {consistencyPct}%</span>
            </div>

            {/* SVG Line Graph */}
            {chartData.length > 1 ? (
              <svg className="w-full h-28 overflow-visible">
                {(() => {
                  const maxWpm = Math.max(40, ...chartData.map((d) => Math.max(d.wpm, d.rawWpm))) + 10;
                  const totalSec = chartData[chartData.length - 1].second || 1;

                  const points = chartData
                    .map((d) => {
                      const x = (d.second / totalSec) * 100;
                      const y = 100 - (d.wpm / maxWpm) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  const rawPoints = chartData
                    .map((d) => {
                      const x = (d.second / totalSec) * 100;
                      const y = 100 - (d.rawWpm / maxWpm) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      {/* Grid guideline */}
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={`${theme.subColor}30`}
                        strokeDasharray="4 4"
                      />

                      {/* Raw WPM dashed line */}
                      <polyline
                        fill="none"
                        stroke={theme.subColor}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        points={rawPoints}
                        opacity="0.6"
                      />

                      {/* Net WPM bold curve */}
                      <polyline
                        fill="none"
                        stroke={theme.mainColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />

                      {/* Red error points */}
                      {chartData.map((d, i) => {
                        if (d.errors === 0) return null;
                        const cx = `${(d.second / totalSec) * 100}%`;
                        const cy = `${100 - (d.wpm / maxWpm) * 100}%`;
                        return (
                          <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r="4"
                            fill={theme.errorColor}
                            stroke={theme.bgColor}
                            strokeWidth="1.5"
                          >
                            <title>{`${d.errors} lỗi ở giây thứ ${d.second}`}</title>
                          </circle>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs opacity-60">
                Chưa đủ dữ liệu thời gian để vẽ biểu đồ
              </div>
            )}
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono">
            <div>
              <p style={{ color: theme.subColor }}>kiểu bài</p>
              <p style={{ color: theme.textColor }} className="font-bold text-sm mt-0.5">
                {mode} {mode === 'time' ? `${timeSec}s` : mode === 'words' ? `${wordCount}w` : ''}
              </p>
            </div>

            <div>
              <p style={{ color: theme.subColor }}>tốc độ thô</p>
              <p style={{ color: theme.textColor }} className="font-bold text-sm mt-0.5">
                {liveRawWpm} wpm
              </p>
            </div>

            <div>
              <p style={{ color: theme.subColor }}>ký tự (đúng/sai)</p>
              <p style={{ color: theme.textColor }} className="font-bold text-sm mt-0.5">
                {Math.max(0, totalKeystrokes - errorCount)}/{errorCount}
              </p>
            </div>

            <div>
              <p style={{ color: theme.subColor }}>độ đồng đều</p>
              <p style={{ color: theme.textColor }} className="font-bold text-sm mt-0.5">
                {consistencyPct}%
              </p>
            </div>

            <div>
              <p style={{ color: theme.subColor }}>thời gian</p>
              <p style={{ color: theme.textColor }} className="font-bold text-sm mt-0.5">
                {elapsedSec}s
              </p>
            </div>
          </div>

          {/* Action Buttons: Next test | Restart | Practice missed | Copy */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => initializeTest()}
              style={{
                backgroundColor: theme.mainColor,
                color: theme.bgColor,
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Bài tiếp theo (Tab)</span>
            </button>

            {errorCount > 0 && (
              <button
                type="button"
                onClick={practiceMissedWords}
                style={{
                  backgroundColor: `${theme.subColor}20`,
                  color: theme.textColor,
                  borderColor: `${theme.subColor}40`,
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Luyện các từ gõ sai</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyResult}
              style={{
                backgroundColor: `${theme.subColor}20`,
                color: theme.textColor,
                borderColor: `${theme.subColor}40`,
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedResult ? 'Đã sao chép!' : 'Chia sẻ kết quả'}</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FOOTER: QUICK SHORTCUTS TIPS (like Monkeytype) */}
      <div
        style={{ color: theme.subColor }}
        className="w-full flex flex-wrap items-center justify-between text-[11px] pt-3 border-t border-white/5 z-10"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 font-bold">tab</kbd>
            <span>khởi động lại</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-black/20 font-bold">esc</kbd>
            <span>bảng lệnh nhanh</span>
          </span>
        </div>

        {/* Quick Sound & Caret status in footer */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const packs: MonkeySoundPack[] = ['thocky', 'clicky', 'creamy', 'typewriter', 'off'];
              const nextIdx = (packs.indexOf(soundPack) + 1) % packs.length;
              setSoundPack(packs[nextIdx]);
            }}
            className="hover:opacity-100 transition-opacity cursor-pointer capitalize"
          >
            switch: {soundPack}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              const styles: MonkeyCaretStyle[] = ['smooth', 'line', 'block', 'underline'];
              const nextIdx = (styles.indexOf(caretStyle) + 1) % styles.length;
              setCaretStyle(styles[nextIdx]);
            }}
            className="hover:opacity-100 transition-opacity cursor-pointer capitalize"
          >
            caret: {caretStyle}
          </button>
        </div>
      </div>

      {/* COMMAND PALETTE MODAL (Esc / Ctrl+K) */}
      {openCommandPalette && (
        <div
          onClick={() => setOpenCommandPalette(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.bgColor,
              borderColor: `${theme.subColor}40`,
              color: theme.textColor,
            }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search style={{ color: theme.subColor }} className="w-4 h-4 shrink-0" />
              <input
                autoFocus
                type="text"
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                placeholder="Gõ lệnh tìm kiếm (theme, thời gian, từ ngữ, switch âm thanh)..."
                style={{ color: theme.textColor }}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-40"
              />
              <button
                type="button"
                onClick={() => setOpenCommandPalette(false)}
                className="p-1 rounded opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5 text-xs">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center opacity-50">Không tìm thấy lệnh phù hợp</div>
              ) : (
                filteredCommands.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      item.action();
                      setOpenCommandPalette(false);
                      setCommandSearch('');
                      initializeTest();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span style={{ color: theme.mainColor }} className="text-[11px] opacity-70">
                      Chọn ↵
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* THEME PICKER MODAL */}
      {openThemeModal && (
        <div
          onClick={() => setOpenThemeModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.bgColor,
              borderColor: `${theme.subColor}40`,
              color: theme.textColor,
            }}
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Bảng màu giao diện Monkeytype</span>
              </h3>
              <button
                type="button"
                onClick={() => setOpenThemeModal(false)}
                className="p-1 rounded opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(MONKEY_THEMES) as MonkeyThemeId[]).map((id) => {
                const t = MONKEY_THEMES[id];
                const isActive = themeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setThemeId(id);
                      setOpenThemeModal(false);
                    }}
                    style={{
                      backgroundColor: t.bgColor,
                      borderColor: isActive ? t.mainColor : `${t.subColor}40`,
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isActive ? 'ring-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: t.mainColor }} className="text-xs font-bold">
                        {t.name}
                      </span>
                      {isActive && <Check style={{ color: t.mainColor }} className="w-3.5 h-3.5" />}
                    </div>
                    {/* Color palette circles preview */}
                    <div className="flex items-center gap-1.5">
                      <div style={{ backgroundColor: t.mainColor }} className="w-3.5 h-3.5 rounded-full" />
                      <div style={{ backgroundColor: t.textColor }} className="w-3.5 h-3.5 rounded-full" />
                      <div style={{ backgroundColor: t.subColor }} className="w-3.5 h-3.5 rounded-full" />
                      <div style={{ backgroundColor: t.errorColor }} className="w-3.5 h-3.5 rounded-full" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
