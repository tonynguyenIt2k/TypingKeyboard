import React, { useEffect, useState } from 'react';
import { FINGER_INFO, KEYBOARD_ROWS, ActiveKeyGuidance } from '../data/keyboardData';
import { FingerId, KeyFeedbackEvent } from '../types';

interface VirtualKeyboardProps {
  guidance: ActiveKeyGuidance;
  pressedCodes: Set<string>;
  keyFeedback: KeyFeedbackEvent | null;
  showFingerZones: boolean;
  showHandSvg: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  guidance,
  pressedCodes,
  keyFeedback,
  showFingerZones,
  showHandSvg,
}) => {
  const [activeFeedback, setActiveFeedback] = useState<KeyFeedbackEvent | null>(null);

  useEffect(() => {
    if (!keyFeedback) {
      setActiveFeedback(null);
      return;
    }
    setActiveFeedback(keyFeedback);
    const timer = window.setTimeout(() => {
      setActiveFeedback((current) =>
        current && current.seq === keyFeedback.seq ? null : current
      );
    }, 200);
    return () => window.clearTimeout(timer);
  }, [keyFeedback]);

  const activeKeyCode = guidance.primaryKey?.code || null;
  const activeShiftCode = guidance.shiftCode;
  const activeFingerId = guidance.finger?.id || null;

  const isShiftFingerActive = (side: 'left' | 'right') => {
    if (side === 'left' && activeShiftCode === 'ShiftLeft') return true;
    if (side === 'right' && activeShiftCode === 'ShiftRight') return true;
    return false;
  };

  return (
    <div className="w-full select-none space-y-5">
      {/* Guidance callout bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 px-1">
        <div className="flex items-center gap-3">
          {guidance.finger ? (
            <>
              <span className="font-semibold text-slate-900">
                Ngón phụ trách: {guidance.finger.name}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Phím chuẩn: {guidance.finger.homeKey}</span>
              {activeShiftCode && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-medium text-sky-700">
                    Kết hợp giữ {activeShiftCode === 'ShiftLeft' ? 'Shift Trái (Út trái)' : 'Shift Phải (Út phải)'}
                  </span>
                </>
              )}
              {guidance.telexHint && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono text-xs text-amber-700">
                    Gợi ý Telex: {guidance.telexHint}
                  </span>
                </>
              )}
            </>
          ) : (
            <span>Hoàn tất đoạn gõ hoặc nhấn Đặt lại để bắt đầu bài mới</span>
          )}
        </div>

        <div className="hidden xl:flex items-center gap-3 text-xs text-slate-500">
          <span>Út: A / ;</span>
          <span aria-hidden="true">·</span>
          <span>Áp út: S / L</span>
          <span aria-hidden="true">·</span>
          <span>Giữa: D / K</span>
          <span aria-hidden="true">·</span>
          <span>Trỏ: F-G / H-J</span>
          <span aria-hidden="true">·</span>
          <span>Cái: Space</span>
        </div>
      </div>

      {/* QWERTY Keyboard Frame */}
      <div className="w-full rounded-xl bg-white border border-slate-200 p-3 sm:p-4 overflow-x-auto">
        <div className="min-w-[680px] flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-stretch gap-1.5 w-full">
              {row.map((keyDef) => {
                const isTarget = keyDef.code === activeKeyCode || keyDef.code === activeShiftCode;
                const isPressed = pressedCodes.has(keyDef.code);
                const isFeedbackHit =
                  activeFeedback !== null &&
                  (keyDef.code === activeFeedback.code || keyDef.code === activeFeedback.shiftCode);
                const feedbackOutcome = isFeedbackHit ? activeFeedback.outcome : null;
                const fingerMeta = FINGER_INFO[keyDef.finger];

                let keyClasses =
                  'bg-slate-50 border-slate-200 text-slate-700';

                if (showFingerZones && !isTarget && !isPressed && !feedbackOutcome) {
                  keyClasses = fingerMeta.keyTint;
                }

                if (isTarget) {
                  keyClasses = `${fingerMeta.accentBg} border-transparent text-white shadow-sm -translate-y-0.5`;
                }

                if (isPressed && !feedbackOutcome) {
                  keyClasses = 'bg-slate-800 border-slate-800 text-white scale-[0.96]';
                }

                // Haptic feedback simulation & gentle semantic color shift on typed key
                let feedbackAnimClass = '';
                if (feedbackOutcome === 'correct') {
                  keyClasses =
                    'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs';
                  feedbackAnimClass = 'animate-key-correct';
                } else if (feedbackOutcome === 'error') {
                  keyClasses =
                    'bg-rose-100 border-rose-400 text-rose-950 ring-2 ring-rose-500/20';
                  feedbackAnimClass = 'animate-key-error';
                }

                const isDarkSurface =
                  (isTarget || isPressed) && !feedbackOutcome;

                return (
                  <div
                    key={feedbackOutcome ? `${keyDef.code}-${activeFeedback?.seq}` : keyDef.code}
                    style={{ flex: keyDef.width ?? 1 }}
                    className={`relative h-11 sm:h-12 rounded-lg border px-2 flex flex-col justify-center items-center font-mono transition-colors duration-150 ${keyClasses} ${feedbackAnimClass}`}
                  >
                    {keyDef.shiftLabel && (
                      <span
                        className={`text-[10px] leading-none mb-0.5 ${
                          isDarkSurface
                            ? 'text-white/80'
                            : feedbackOutcome === 'correct'
                              ? 'text-emerald-700'
                              : feedbackOutcome === 'error'
                                ? 'text-rose-700'
                                : 'text-slate-400'
                        }`}
                      >
                        {keyDef.shiftLabel}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-semibold leading-none whitespace-nowrap">
                      {keyDef.label}
                    </span>

                    {/* Tactile F & J Home Row Bumps */}
                    {keyDef.isHomeBump && (
                      <span
                        className={`absolute bottom-1.5 w-3.5 h-0.5 rounded-full ${
                          isDarkSurface
                            ? 'bg-white'
                            : feedbackOutcome === 'correct'
                              ? 'bg-emerald-700'
                              : feedbackOutcome === 'error'
                                ? 'bg-rose-700'
                                : 'bg-slate-500'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 10-Finger Anatomical SVG Guide */}
      {showHandSvg && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Left Hand */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-100/70 border border-slate-200/80">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">Bàn tay trái (A · S · D · F)</p>
              <p className="text-xs text-slate-500">
                {activeFingerId && FINGER_INFO[activeFingerId].hand === 'Tay trái'
                  ? `Đang kích hoạt: ${FINGER_INFO[activeFingerId].name}`
                  : isShiftFingerActive('left')
                    ? 'Đang kích hoạt: Ngón út trái giữ Shift'
                    : 'Đặt hờ các đầu ngón trên A, S, D, F'}
              </p>
            </div>

            <svg
              viewBox="0 0 220 110"
              className="w-40 h-20 shrink-0"
              role="img"
              aria-label="Sơ đồ 5 ngón bàn tay trái"
            >
              {/* Palm base */}
              <path
                d="M32 76 C32 58, 148 58, 156 78 L152 106 L38 106 Z"
                fill="#E2E8F0"
              />
              {/* Left Pinky (LP) */}
              <FingerBar
                x={28}
                y={30}
                height={48}
                label="Út"
                fingerId={FingerId.LeftPinky}
                isActive={activeFingerId === FingerId.LeftPinky || isShiftFingerActive('left')}
              />
              {/* Left Ring (LR) */}
              <FingerBar
                x={58}
                y={16}
                height={60}
                label="Áp"
                fingerId={FingerId.LeftRing}
                isActive={activeFingerId === FingerId.LeftRing}
              />
              {/* Left Middle (LM) */}
              <FingerBar
                x={88}
                y={8}
                height={68}
                label="Giữa"
                fingerId={FingerId.LeftMiddle}
                isActive={activeFingerId === FingerId.LeftMiddle}
              />
              {/* Left Index (LI) */}
              <FingerBar
                x={118}
                y={18}
                height={58}
                label="Trỏ"
                fingerId={FingerId.LeftIndex}
                isActive={activeFingerId === FingerId.LeftIndex}
              />
              {/* Left Thumb (TH) */}
              <FingerBar
                x={156}
                y={50}
                height={44}
                label="Cái"
                fingerId={FingerId.Thumb}
                isActive={activeFingerId === FingerId.Thumb}
                rotate={24}
              />
            </svg>
          </div>

          {/* Right Hand */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-100/70 border border-slate-200/80">
            <svg
              viewBox="0 0 220 110"
              className="w-40 h-20 shrink-0"
              role="img"
              aria-label="Sơ đồ 5 ngón bàn tay phải"
            >
              {/* Palm base */}
              <path
                d="M64 78 C72 58, 188 58, 188 76 L182 106 L68 106 Z"
                fill="#E2E8F0"
              />
              {/* Right Thumb (TH) */}
              <FingerBar
                x={42}
                y={50}
                height={44}
                label="Cái"
                fingerId={FingerId.Thumb}
                isActive={activeFingerId === FingerId.Thumb}
                rotate={-24}
              />
              {/* Right Index (RI) */}
              <FingerBar
                x={80}
                y={18}
                height={58}
                label="Trỏ"
                fingerId={FingerId.RightIndex}
                isActive={activeFingerId === FingerId.RightIndex}
              />
              {/* Right Middle (RM) */}
              <FingerBar
                x={110}
                y={8}
                height={68}
                label="Giữa"
                fingerId={FingerId.RightMiddle}
                isActive={activeFingerId === FingerId.RightMiddle}
              />
              {/* Right Ring (RR) */}
              <FingerBar
                x={140}
                y={16}
                height={60}
                label="Áp"
                fingerId={FingerId.RightRing}
                isActive={activeFingerId === FingerId.RightRing}
              />
              {/* Right Pinky (RP) */}
              <FingerBar
                x={170}
                y={30}
                height={48}
                label="Út"
                fingerId={FingerId.RightPinky}
                isActive={activeFingerId === FingerId.RightPinky || isShiftFingerActive('right')}
              />
            </svg>

            <div className="space-y-1 text-right">
              <p className="text-xs font-semibold text-slate-800">Bàn tay phải (J · K · L · ;)</p>
              <p className="text-xs text-slate-500">
                {activeFingerId && FINGER_INFO[activeFingerId].hand === 'Tay phải'
                  ? `Đang kích hoạt: ${FINGER_INFO[activeFingerId].name}`
                  : isShiftFingerActive('right')
                    ? 'Đang kích hoạt: Ngón út phải giữ Shift'
                    : 'Đặt hờ các đầu ngón trên J, K, L, ;'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FingerBarProps {
  x: number;
  y: number;
  height: number;
  label: string;
  fingerId: FingerId;
  isActive: boolean;
  rotate?: number;
}

const FingerBar: React.FC<FingerBarProps> = ({
  x,
  y,
  height,
  label,
  fingerId,
  isActive,
  rotate = 0,
}) => {
  const info = FINGER_INFO[fingerId];
  const fill = isActive ? info.svgFill : '#CBD5E1';
  const textFill = isActive ? '#FFFFFF' : '#334155';
  const cx = x + 11;
  const cy = y + height / 2;

  return (
    <g
      transform={rotate ? `rotate(${rotate} ${cx} ${y + height})` : undefined}
      className="transition-opacity duration-150"
    >
      <rect
        x={x}
        y={y}
        width={22}
        height={height}
        rx={11}
        fill={fill}
        stroke={isActive ? '#0F172A' : '#94A3B8'}
        strokeWidth={isActive ? 1.5 : 1}
      />
      {/* Fingertip indicator when active */}
      {isActive && (
        <circle cx={x + 11} cy={y + 9} r={3.5} fill="#FFFFFF" />
      )}
      <text
        x={x + 11}
        y={cy + 8}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="600"
        fill={textFill}
      >
        {label}
      </text>
    </g>
  );
};
