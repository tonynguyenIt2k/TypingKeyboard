import React, { useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff, Hand, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TypingCanvasProps {
  targetText: string;
  typedText: string;
  isFocused: boolean;
  isFinished: boolean;
  wpm: number;
  accuracy: number;
  elapsedSec: number;
  countdownSec: number | null;
  errorCount: number;
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  showFingerZones: boolean;
  showHandSvg: boolean;
  onInputChange: (val: string) => void;
  onFocusChange: (focused: boolean) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleErrorSound: () => void;
  onToggleZones: () => void;
  onToggleHands: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  targetText,
  typedText,
  isFocused,
  isFinished,
  wpm,
  accuracy,
  elapsedSec,
  countdownSec,
  errorCount,
  soundEnabled,
  errorSoundEnabled,
  showFingerZones,
  showHandSvg,
  onInputChange,
  onFocusChange,
  onReset,
  onToggleSound,
  onToggleErrorSound,
  onToggleZones,
  onToggleHands,
  inputRef,
}) => {
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const charEl = activeCharRef.current;
      const charTop = charEl.offsetTop;
      const containerScroll = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (charTop - containerScroll > containerHeight - 56 || charTop < containerScroll) {
        container.scrollTo({
          top: Math.max(0, charTop - 44),
          behavior: 'smooth',
        });
      }
    }
  }, [typedText.length]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const progressPct = targetText.length > 0
    ? Math.min(100, Math.round((typedText.length / targetText.length) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* Live Telemetry & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        {/* Metrics with tabular numerals and explicit state icons/labels */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-slate-500">Tốc độ (WPM)</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">{wpm}</p>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <p className="text-xs text-slate-500">Độ chính xác</p>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {accuracy}%
              </span>
              {accuracy >= 94 ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Chuẩn
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cần chậm lại
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <p className="text-xs text-slate-500">
              {countdownSec !== null ? 'Thời gian còn lại' : 'Thời gian gõ'}
            </p>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatTime(countdownSec !== null ? countdownSec : elapsedSec)}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <p className="text-xs text-slate-500">Lỗi gõ sai</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">{errorCount}</p>
          </div>
        </div>

        {/* Interactive Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Bật hoặc tắt âm thanh gõ phím cơ"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Âm phím</span>
          </button>

          <button
            type="button"
            onClick={onToggleErrorSound}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              errorSoundEnabled
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Bật hoặc tắt âm báo lỗi (buzzer nhẹ) khi gõ sai ký tự"
          >
            {errorSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-rose-700" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Âm báo lỗi</span>
          </button>

          <button
            type="button"
            onClick={onToggleZones}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showFingerZones
                ? 'bg-sky-50 text-sky-900 border-sky-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ẩn/hiện màu phân vùng ngón tay"
          >
            {showFingerZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Vùng ngón</span>
          </button>

          <button
            type="button"
            onClick={onToggleHands}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showHandSvg
                ? 'bg-sky-50 text-sky-900 border-sky-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ẩn/hiện sơ đồ 2 bàn tay"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Bàn tay</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Subtle Progress Hairline */}
      <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-600 transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${progressPct / 100})` }}
        />
      </div>

      {/* Interactive Typing Stage: Sample Text + Visible Live Input Box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative rounded-xl bg-white border transition-colors ${
          isFocused
            ? 'border-sky-600 ring-2 ring-sky-600/15'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {/* Top strip: Target vs Actual live character inspector */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-600">
              Cần gõ tiếp:{' '}
              <strong className="font-mono text-sm px-1.5 py-0.5 rounded bg-sky-100 text-sky-950">
                {typedText.length < targetText.length
                  ? targetText[typedText.length] === ' '
                    ? '␣ (Cách)'
                    : targetText[typedText.length]
                  : 'Hoàn tất'}
              </strong>
            </span>

            {typedText.length > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600">
                  Vừa gõ ra:{' '}
                  <strong
                    className={`font-mono text-sm px-1.5 py-0.5 rounded ${
                      typedText[typedText.length - 1] === targetText[typedText.length - 1]
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {typedText[typedText.length - 1] === ' '
                      ? '␣ (Cách)'
                      : typedText[typedText.length - 1]}
                  </strong>
                  {typedText[typedText.length - 1] !== targetText[typedText.length - 1] && (
                    <span className="ml-1.5 text-rose-700 font-medium">
                      (Mẫu là "{targetText[typedText.length - 1] === ' ' ? '␣ Cách' : targetText[typedText.length - 1]}")
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          <span className="text-slate-500">
            Tiến độ:{' '}
            <strong className="font-mono tabular-nums text-slate-800">
              {typedText.length}/{targetText.length}
            </strong>{' '}
            ký tự
          </span>
        </div>

        {/* Character-by-character sample display */}
        <div
          ref={textContainerRef}
          onClick={() => inputRef.current?.focus()}
          className="px-6 py-5 max-h-[164px] overflow-y-auto font-mono text-xl sm:text-2xl leading-[1.85] tracking-wide select-none whitespace-pre-wrap break-words cursor-text"
        >
          {Array.from(targetText).map((expectedChar, index) => {
            const isTyped = index < typedText.length;
            const isJustTyped = index === typedText.length - 1 && !isFinished;
            const isCurrent = index === typedText.length && !isFinished;
            const actualChar = isTyped ? typedText[index] : null;
            const isCorrect = isTyped && actualChar === expectedChar;

            let charStyle = 'text-slate-400';
            if (isTyped) {
              charStyle = isCorrect
                ? 'text-emerald-700'
                : 'text-rose-700 bg-rose-100 underline decoration-rose-500 decoration-2 rounded-xs';
            }
            if (isCurrent) {
              charStyle =
                'text-slate-950 font-semibold bg-sky-100 border-b-2 border-sky-600 rounded-t-xs shadow-2xs';
            }

            const displayChar =
              expectedChar === ' ' && isTyped && !isCorrect ? '␣' : expectedChar;

            const canScale =
              expectedChar !== '\n' &&
              (expectedChar !== ' ' || (isTyped && !isCorrect)) &&
              (isCurrent || isJustTyped);
            const motionClass = isCurrent
              ? 'inline-block origin-bottom animate-char-active'
              : isJustTyped
                ? 'inline-block origin-bottom animate-char-typed'
                : '';

            return (
              <span
                key={index}
                ref={isCurrent ? activeCharRef : null}
                className={`${charStyle} ${canScale ? motionClass : ''}`}
              >
                {displayChar}
              </span>
            );
          })}
        </div>

        {/* Visible Real-Time Input Box where the user clearly sees every character & Vietnamese IME composition */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label
              htmlFor="live-typing-input"
              className="font-semibold text-slate-700"
            >
              Chữ bạn đang gõ trực tiếp:
            </label>
            <span className="text-slate-500">
              Nhấn <kbd className="font-mono font-semibold text-slate-700">Backspace</kbd> để sửa ký tự sai · <kbd className="font-mono font-semibold text-slate-700">Esc</kbd> để đặt lại
            </span>
          </div>

          <textarea
            id="live-typing-input"
            ref={inputRef}
            rows={2}
            value={typedText}
            disabled={isFinished}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            onPaste={(e) => e.preventDefault()}
            placeholder="Nhấp vào đây và bắt đầu gõ theo văn bản mẫu phía trên..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Ô hiển thị chữ bạn đang gõ trực tiếp"
            className="w-full resize-none rounded-lg bg-white border border-slate-300 px-4 py-2.5 font-mono text-lg sm:text-xl leading-relaxed text-slate-900 placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
          />
        </div>
      </div>
    </div>
  );
};
