import React, { useEffect, useRef } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Shuffle,
} from 'lucide-react';
import { ActiveKeyGuidance } from '../data/keyboardData';
import { KeyFeedbackEvent } from '../types';
import { ZEN_LYRIC_PASSAGES, ZenPassage } from '../data/lessonsData';

interface ZenKaraokeStageProps {
  targetText: string;
  typedText: string;
  isFocused: boolean;
  isFinished: boolean;
  wpm: number;
  accuracy: number;
  elapsedSec: number;
  guidance: ActiveKeyGuidance;
  pressedCodes: Set<string>;
  keyFeedback: KeyFeedbackEvent | null;
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  isFullScreen: boolean;
  activePassageId: string;
  onSelectPassage: (passage: ZenPassage) => void;
  onNextPassage: () => void;
  onInputChange: (val: string) => void;
  onFocusChange: (focused: boolean) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleErrorSound: () => void;
  onToggleFullScreen: () => void;
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
  wpm,
  accuracy,
  elapsedSec,
  guidance,
  pressedCodes,
  keyFeedback,
  soundEnabled,
  errorSoundEnabled,
  isFullScreen,
  activePassageId,
  onSelectPassage,
  onNextPassage,
  onInputChange,
  onFocusChange,
  onReset,
  onToggleSound,
  onToggleErrorSound,
  onToggleFullScreen,
  inputRef,
}) => {
  const activeCursorRef = useRef<HTMLSpanElement | null>(null);
  const lyricContainerRef = useRef<HTMLDivElement | null>(null);

  // Smoothly keep the current line centered in the 3-line lyric window
  useEffect(() => {
    if (activeCursorRef.current && lyricContainerRef.current) {
      const container = lyricContainerRef.current;
      const cursor = activeCursorRef.current;
      const targetScroll = cursor.offsetTop - container.clientHeight / 2 + cursor.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [typedText.length]);

  const activeKeyCode = guidance.primaryKey?.code || null;
  const isSpaceTarget = activeKeyCode === 'Space';
  const isSpacePressed = pressedCodes.has('Space');

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`${
        isFullScreen
          ? 'fixed inset-0 z-50 rounded-none p-8 sm:p-14'
          : 'relative rounded-2xl p-6 sm:p-10 min-h-[540px]'
      } bg-[#181A1D] text-white flex flex-col justify-between select-none cursor-text border border-white/10 shadow-xl transition-colors`}
    >
      {/* Top Quiet Minimalist Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400"
      >
        {/* Passage Pills / Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ZEN_LYRIC_PASSAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPassage(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePassageId === p.id
                  ? 'bg-white/14 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onNextPassage}
            title="Đổi đoạn ngẫu nhiên tiếp theo"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Đổi câu</span>
          </button>
        </div>

        {/* Minimalist Telemetry & Controls */}
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
              title="Bật/tắt âm báo lỗi"
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                errorSoundEnabled ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Buzzer
            </button>

            <button
              type="button"
              onClick={onReset}
              title="Đặt lại (Esc)"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleFullScreen}
              title={isFullScreen ? 'Thu nhỏ về trang' : 'Toàn màn hình Zen Focus'}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Large Bold Lyric / Karaoke Display with Glowing Double-Bar Caret */}
      <div className="my-auto py-8 sm:py-12 max-w-4xl w-full mx-auto relative">
        <textarea
          ref={inputRef}
          value={typedText}
          disabled={isFinished}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="Khung gõ chế độ Zen Karaoke"
          className="sr-only"
        />

        <div
          ref={lyricContainerRef}
          className="max-h-[220px] sm:max-h-[260px] overflow-hidden text-3xl sm:text-5xl font-bold leading-[1.48] tracking-wide whitespace-pre-wrap break-words"
        >
          {Array.from(targetText).map((expectedChar, index) => {
            const isTyped = index < typedText.length;
            const isCurrent = index === typedText.length && !isFinished;
            const actualChar = isTyped ? typedText[index] : null;
            const isCorrect = isTyped && actualChar === expectedChar;

            let charClass = 'text-zinc-600 transition-colors duration-100';
            if (isTyped) {
              charClass = isCorrect
                ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]'
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
                    <span className="w-[3px] sm:w-[3.5px] h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                    <span className="w-[3px] sm:w-[3.5px] h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                  </span>
                )}
                <span className={charClass}>{displayChar}</span>
              </React.Fragment>
            );
          })}
        </div>

        {!isFocused && !isFinished && (
          <p className="mt-4 text-xs text-zinc-500 font-medium">
            Nhấp chuột hoặc gõ phím bất kỳ để bắt đầu dòng chữ...
          </p>
        )}
      </div>

      {/* Bottom Minimalist Floating Keycap Matrix + Bright White Spacebar (matching reference photo) */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-2 pt-2">
        {COMPACT_ALPHA_ROWS.map((row, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center justify-center gap-1.5 sm:gap-2"
            style={{
              paddingLeft: rIdx === 1 ? '12px' : rIdx === 2 ? '26px' : '0px',
            }}
          >
            {row.map((k) => {
              const isTarget = activeKeyCode === k.code;
              const isPressed = pressedCodes.has(k.code);
              const isHit = keyFeedback && keyFeedback.code === k.code;

              let keyStyle = 'bg-white/[0.06] text-zinc-400 border-white/[0.06]';
              let animClass = '';

              if (isTarget) {
                keyStyle = 'bg-white/20 text-white border-white/40 shadow-[0_0_14px_rgba(255,255,255,0.16)]';
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
        <div className="pt-1 w-full flex justify-center">
          <div
            className={`w-52 sm:w-64 h-8 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-100 ${
              isSpacePressed
                ? 'bg-emerald-300 text-zinc-950 scale-[0.97]'
                : isSpaceTarget
                  ? 'bg-white text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.45)]'
                  : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            <span className="w-8 h-0.5 rounded-full bg-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
