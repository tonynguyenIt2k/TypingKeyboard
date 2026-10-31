import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Shuffle,
  PenLine,
  ArrowLeft,
  ArrowRight,
  Check,
  Activity,
  X,
} from 'lucide-react';
import { ActiveKeyGuidance } from '../data/keyboardData';
import { KeyFeedbackEvent, SessionRecord } from '../types';
import { ZEN_LYRIC_PASSAGES, ZenPassage } from '../data/lessonsData';

interface ZenKaraokeStageProps {
  targetText: string;
  typedText: string;
  isFocused: boolean;
  isFinished: boolean;
  lastRecord: SessionRecord | null;
  wpm: number;
  accuracy: number;
  elapsedSec: number;
  guidance: ActiveKeyGuidance;
  pressedCodes: Set<string>;
  keyFeedback: KeyFeedbackEvent | null;
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  metronomeEnabled: boolean;
  metronomeWpm: number;
  activePassageId: string;
  customZenText: string;
  onSelectPassage: (passage: ZenPassage) => void;
  onApplyCustomZenText: (text: string) => void;
  onNextPassage: () => void;
  onExitZen: () => void;
  onInputChange: (val: string) => void;
  onFocusChange: (focused: boolean) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleErrorSound: () => void;
  onToggleMetronome: () => void;
  onChangeMetronomeWpm: (wpm: number) => void;
  onEditingCustomChange: (editing: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

interface CompactKey {
  code: string;
  label: string;
  isBump?: boolean;
}

const COMPACT_ALPHA_ROWS: CompactKey[][] = [
  [
    { code: 'KeyQ', label: 'q' },
    { code: 'KeyW', label: 'w' },
    { code: 'KeyE', label: 'e' },
    { code: 'KeyR', label: 'r' },
    { code: 'KeyT', label: 't' },
    { code: 'KeyY', label: 'y' },
    { code: 'KeyU', label: 'u' },
    { code: 'KeyI', label: 'i' },
    { code: 'KeyO', label: 'o' },
    { code: 'KeyP', label: 'p' },
    { code: 'BracketLeft', label: '[' },
    { code: 'BracketRight', label: ']' },
  ],
  [
    { code: 'KeyA', label: 'a' },
    { code: 'KeyS', label: 's' },
    { code: 'KeyD', label: 'd' },
    { code: 'KeyF', label: 'f', isBump: true },
    { code: 'KeyG', label: 'g' },
    { code: 'KeyH', label: 'h' },
    { code: 'KeyJ', label: 'j', isBump: true },
    { code: 'KeyK', label: 'k' },
    { code: 'KeyL', label: 'l' },
    { code: 'Semicolon', label: ';' },
    { code: 'Quote', label: "'" },
  ],
  [
    { code: 'KeyZ', label: 'z' },
    { code: 'KeyX', label: 'x' },
    { code: 'KeyC', label: 'c' },
    { code: 'KeyV', label: 'v' },
    { code: 'KeyB', label: 'b' },
    { code: 'KeyN', label: 'n' },
    { code: 'KeyM', label: 'm' },
    { code: 'Comma', label: ',' },
    { code: 'Period', label: '.' },
    { code: 'Slash', label: '/' },
  ],
];

export const ZenKaraokeStage: React.FC<ZenKaraokeStageProps> = ({
  targetText,
  typedText,
  isFocused,
  isFinished,
  lastRecord,
  wpm,
  accuracy,
  elapsedSec,
  guidance,
  pressedCodes,
  keyFeedback,
  soundEnabled,
  errorSoundEnabled,
  metronomeEnabled,
  metronomeWpm,
  activePassageId,
  customZenText,
  onSelectPassage,
  onApplyCustomZenText,
  onNextPassage,
  onExitZen,
  onInputChange,
  onFocusChange,
  onReset,
  onToggleSound,
  onToggleErrorSound,
  onToggleMetronome,
  onChangeMetronomeWpm,
  onEditingCustomChange,
  inputRef,
}) => {
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCursorRef = useRef<HTMLSpanElement | null>(null);
  const lyricContainerRef = useRef<HTMLDivElement | null>(null);
  const customInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [draftText, setDraftText] = useState(customZenText || targetText);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  // Sync browser native fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Lock background scroll while full-screen Zen Lyric stage is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Notify parent when custom modal is open so global key auto-focus doesn't steal typing from modal
  useEffect(() => {
    onEditingCustomChange(isCustomModalOpen);
    if (isCustomModalOpen) {
      requestAnimationFrame(() => customInputRef.current?.focus());
    }
  }, [isCustomModalOpen, onEditingCustomChange]);

  // Smoothly keep the current line centered in the 3-line lyric window
  useEffect(() => {
    if (activeCursorRef.current && lyricContainerRef.current) {
      const container = lyricContainerRef.current;
      const cursor = activeCursorRef.current;
      const targetScroll =
        cursor.offsetTop - container.clientHeight / 2 + cursor.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [typedText.length, targetText]);

  const toggleNativeFullscreen = async () => {
    try {
      if (!document.fullscreenElement && stageContainerRef.current) {
        await stageContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if iframe restricts Fullscreen API; stage already fills 100vw x 100vh via fixed inset-0
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleExit = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    onExitZen();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftText.replace(/\s+/g, ' ').trim();
    if (cleaned.length >= 5) {
      onApplyCustomZenText(cleaned);
      setIsCustomModalOpen(false);
    }
  };

  const activeKeyCode = guidance.primaryKey?.code || null;
  const isSpaceTarget = activeKeyCode === 'Space';
  const isSpacePressed = pressedCodes.has('Space');

  return (
    <div
      ref={stageContainerRef}
      onClick={() => {
        if (!isCustomModalOpen && !isFinished) {
          inputRef.current?.focus();
        }
      }}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#141619] text-white flex flex-col justify-between px-6 sm:px-14 py-6 sm:py-9 select-none cursor-text overflow-hidden"
    >
      {/* Top Minimalist Floating Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 z-20"
      >
        {/* Left: Exit Fullscreen Stage + Preset Lyric Passages + Custom Lyric Trigger */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleExit}
            title="Thoát chế độ Zen toàn màn hình"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-1 rounded-lg bg-white/[0.08] text-zinc-200 hover:bg-white/15 hover:text-white font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Thoát Zen</span>
          </button>

          {ZEN_LYRIC_PASSAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPassage(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePassageId === p.id
                  ? 'bg-white/16 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Custom Lyric Content Button */}
          <button
            type="button"
            onClick={() => {
              setDraftText(customZenText || targetText);
              setIsCustomModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePassageId === 'custom'
                ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                : 'bg-white/[0.06] text-zinc-200 hover:bg-white/14 hover:text-white'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Tùy chọn nội dung</span>
          </button>

          <button
            type="button"
            onClick={onNextPassage}
            title="Chuyển nhanh sang câu mẫu tiếp theo"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Đổi bài</span>
          </button>
        </div>

        {/* Right: Minimalist Live Stats & Audio / Native Fullscreen Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 font-mono tabular-nums text-xs text-zinc-300">
            <span>{wpm} WPM</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{accuracy}%</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{elapsedSec}s</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center rounded-lg bg-white/[0.06] p-0.5">
              <button
                type="button"
                onClick={onToggleMetronome}
                title="Bật/tắt nhịp đếm Metronome"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                  metronomeEnabled
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{metronomeWpm}</span>
              </button>
              {metronomeEnabled && (
                <div className="flex items-center px-1 gap-0.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => onChangeMetronomeWpm(Math.max(15, metronomeWpm - 5))}
                    className="px-1 text-zinc-400 hover:text-white cursor-pointer"
                    title="Giảm 5 WPM"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeMetronomeWpm(Math.min(90, metronomeWpm + 5))}
                    className="px-1 text-zinc-400 hover:text-white cursor-pointer"
                    title="Tăng 5 WPM"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              title="Bật/tắt âm phím cơ"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                soundEnabled ? 'bg-white/12 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleErrorSound}
              title="Bật/tắt âm báo lỗi Buzzer"
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                errorSoundEnabled
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Buzzer
            </button>

            <button
              type="button"
              onClick={onReset}
              title="Đặt lại từ đầu (Esc)"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleNativeFullscreen}
              title={isBrowserFullscreen ? 'Thoát F11 Toàn màn hình' : 'Bật toàn màn hình tuyệt đối (F11)'}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isBrowserFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center Stage: Immersive Bold Lyric Stream OR Dark In-Place Completion Overlay */}
      <div className="my-auto py-6 sm:py-10 max-w-5xl w-full mx-auto relative flex flex-col justify-center">
        <textarea
          ref={inputRef}
          value={typedText}
          disabled={isFinished || isCustomModalOpen}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="Khung gõ chế độ Zen Lyric toàn màn hình"
          className="sr-only"
        />

        {isFinished && lastRecord ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-auto rounded-2xl bg-white/[0.04] border border-white/12 p-8 sm:p-10 space-y-6 cursor-default"
          >
            <div className="space-y-1">
              <p className="text-xs font-mono text-zinc-400">Hoàn thành bản gõ Zen Lyric</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {lastRecord.wpm} WPM · Độ chính xác {lastRecord.accuracy}%
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/10 font-mono tabular-nums">
              <div>
                <p className="text-xs text-zinc-400">Tốc độ thô</p>
                <p className="text-xl font-bold text-white mt-1">{lastRecord.rawWpm} WPM</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Thời gian</p>
                <p className="text-xl font-bold text-white mt-1">{lastRecord.durationSec}s</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Số lỗi sai</p>
                <p className="text-xl font-bold text-white mt-1">{lastRecord.errorCount}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraftText(customZenText || targetText);
                  setIsCustomModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] text-zinc-200 hover:bg-white/15 text-xs font-semibold transition-colors cursor-pointer"
              >
                <PenLine className="w-4 h-4" />
                <span>Nhập lời bài hát / văn bản khác</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Gõ lại</span>
                </button>
                <button
                  type="button"
                  onClick={onNextPassage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Bài tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={lyricContainerRef}
              className="max-h-[240px] sm:max-h-[300px] overflow-hidden text-3xl sm:text-5xl md:text-[54px] font-bold leading-[1.48] tracking-wide whitespace-pre-wrap break-words"
            >
              {Array.from(targetText).map((expectedChar, index) => {
                const isTyped = index < typedText.length;
                const isCurrent = index === typedText.length && !isFinished;
                const actualChar = isTyped ? typedText[index] : null;
                const isCorrect = isTyped && actualChar === expectedChar;

                let charClass = 'text-zinc-600 transition-colors duration-100';
                if (isTyped) {
                  charClass = isCorrect
                    ? 'text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.2)]'
                    : 'text-rose-400 underline decoration-rose-500/80 decoration-4 underline-offset-8';
                }

                const displayChar =
                  expectedChar === ' ' && isTyped && !isCorrect ? '␣' : expectedChar;

                return (
                  <React.Fragment key={index}>
                    {/* Iconic Double-Vertical-Bar Caret || right before the active untyped character */}
                    {isCurrent && (
                      <span
                        ref={activeCursorRef}
                        aria-hidden="true"
                        className={`inline-flex items-center gap-[3px] align-middle mx-[2px] -mt-1.5 h-[1.05em] ${
                          isFocused ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <span className="w-[3px] sm:w-[4px] h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                        <span className="w-[3px] sm:w-[4px] h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                      </span>
                    )}
                    <span className={charClass}>{displayChar}</span>
                  </React.Fragment>
                );
              })}
            </div>

            {!isFocused && !isCustomModalOpen && (
              <p className="mt-5 text-xs text-zinc-500 font-medium">
                Nhấp chuột hoặc nhấn phím bất kỳ để bắt đầu gõ · Nhấn &ldquo;Tùy chọn nội dung&rdquo; ở trên để dán lời bài hát của bạn
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom Minimalist Floating Keycap Matrix + Bright White Spacebar */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-2 pt-2">
        {COMPACT_ALPHA_ROWS.map((row, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center justify-center gap-1.5 sm:gap-2"
            style={{
              paddingLeft: rIdx === 1 ? '14px' : rIdx === 2 ? '28px' : '0px',
            }}
          >
            {row.map((k) => {
              const isTarget = activeKeyCode === k.code && !isFinished;
              const isPressed = pressedCodes.has(k.code);
              const isHit = keyFeedback && keyFeedback.code === k.code;

              let keyStyle = 'bg-white/[0.05] text-zinc-400 border-white/[0.06]';
              let animClass = '';

              if (isTarget) {
                keyStyle =
                  'bg-white/20 text-white border-white/40 shadow-[0_0_14px_rgba(255,255,255,0.16)]';
              }
              if (isPressed) {
                keyStyle = 'bg-white text-zinc-950 border-white scale-95';
              }
              if (isHit) {
                if (keyFeedback.outcome === 'correct') {
                  keyStyle = 'bg-emerald-400/25 text-emerald-200 border-emerald-400/50';
                  animClass = 'animate-key-correct';
                } else {
                  keyStyle = 'bg-rose-500/30 text-rose-200 border-rose-400/60';
                  animClass = 'animate-key-error';
                }
              }

              return (
                <div
                  key={isHit ? `${k.code}-${keyFeedback?.seq}` : k.code}
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center font-mono text-xs sm:text-sm font-medium transition-all duration-100 ${keyStyle} ${animClass}`}
                >
                  {k.label}
                  {k.isBump && (
                    <span className="absolute bottom-1.5 w-2.5 h-[2px] rounded-full bg-current opacity-60" />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Prominent Bright White Spacebar Pill at the bottom */}
        <div className="pt-1.5 w-full flex justify-center">
          <div
            className={`w-56 sm:w-72 h-8 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-100 ${
              isSpacePressed
                ? 'bg-emerald-300 text-zinc-950 scale-[0.97]'
                : isSpaceTarget && !isFinished
                  ? 'bg-white text-zinc-900 shadow-[0_0_22px_rgba(255,255,255,0.5)]'
                  : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            <span className="w-10 h-0.5 rounded-full bg-zinc-400" />
          </div>
        </div>
      </div>

      {/* Custom Lyric / Text Editor Modal inside Full-Screen Zen Mode */}
      {isCustomModalOpen && (
        <div
          onClick={() => setIsCustomModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-default"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCustom}
            className="w-full max-w-xl rounded-2xl bg-[#1E2126] border border-white/15 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Tùy chọn nội dung gõ Zen Lyric
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dán lời bài hát yêu thích, đoạn thơ hoặc bất kỳ câu văn nào bạn muốn gõ chill trên nền tối
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Đóng khung tùy chọn nội dung"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={customInputRef}
              rows={5}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Ví dụ: bỏ oh cupid xin đừng để vết thương này luôn đỏ..."
              className="w-full rounded-xl bg-[#121417] border border-white/15 p-4 text-base font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 leading-relaxed"
            />

            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-xs font-mono text-zinc-400">
                {draftText.trim().length} ký tự (tối thiểu 5 ký tự)
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDraftText('')}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Xóa trắng
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={draftText.trim().length < 5}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Áp dụng ngay</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
