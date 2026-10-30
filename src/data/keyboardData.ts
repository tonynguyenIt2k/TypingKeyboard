import { FingerId, FingerInfo, KeyDef } from '../types';

export const FINGER_INFO: Record<FingerId, FingerInfo> = {
  [FingerId.LeftPinky]: {
    id: FingerId.LeftPinky,
    name: 'Ngón út trái',
    shortName: 'Út trái',
    hand: 'Tay trái',
    homeKey: 'A',
    accentBg: 'bg-rose-600',
    accentBorder: 'border-rose-500',
    accentText: 'text-rose-700',
    keyTint: 'bg-rose-50/70 border-rose-200 text-rose-950',
    svgFill: '#E11D48',
  },
  [FingerId.LeftRing]: {
    id: FingerId.LeftRing,
    name: 'Ngón áp út trái',
    shortName: 'Áp út trái',
    hand: 'Tay trái',
    homeKey: 'S',
    accentBg: 'bg-amber-600',
    accentBorder: 'border-amber-500',
    accentText: 'text-amber-700',
    keyTint: 'bg-amber-50/70 border-amber-200 text-amber-950',
    svgFill: '#D97706',
  },
  [FingerId.LeftMiddle]: {
    id: FingerId.LeftMiddle,
    name: 'Ngón giữa trái',
    shortName: 'Giữa trái',
    hand: 'Tay trái',
    homeKey: 'D',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-500',
    accentText: 'text-emerald-700',
    keyTint: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    svgFill: '#059669',
  },
  [FingerId.LeftIndex]: {
    id: FingerId.LeftIndex,
    name: 'Ngón trỏ trái',
    shortName: 'Trỏ trái',
    hand: 'Tay trái',
    homeKey: 'F',
    accentBg: 'bg-sky-600',
    accentBorder: 'border-sky-500',
    accentText: 'text-sky-700',
    keyTint: 'bg-sky-50/80 border-sky-200 text-sky-950',
    svgFill: '#0284C7',
  },
  [FingerId.Thumb]: {
    id: FingerId.Thumb,
    name: 'Ngón cái (Phím Cách)',
    shortName: 'Ngón cái',
    hand: 'Hai ngón cái',
    homeKey: 'Space',
    accentBg: 'bg-slate-700',
    accentBorder: 'border-slate-500',
    accentText: 'text-slate-700',
    keyTint: 'bg-slate-100 border-slate-300 text-slate-900',
    svgFill: '#334155',
  },
  [FingerId.RightIndex]: {
    id: FingerId.RightIndex,
    name: 'Ngón trỏ phải',
    shortName: 'Trỏ phải',
    hand: 'Tay phải',
    homeKey: 'J',
    accentBg: 'bg-indigo-600',
    accentBorder: 'border-indigo-500',
    accentText: 'text-indigo-700',
    keyTint: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
    svgFill: '#4F46E5',
  },
  [FingerId.RightMiddle]: {
    id: FingerId.RightMiddle,
    name: 'Ngón giữa phải',
    shortName: 'Giữa phải',
    hand: 'Tay phải',
    homeKey: 'K',
    accentBg: 'bg-teal-600',
    accentBorder: 'border-teal-500',
    accentText: 'text-teal-700',
    keyTint: 'bg-teal-50/70 border-teal-200 text-teal-950',
    svgFill: '#0D9488',
  },
  [FingerId.RightRing]: {
    id: FingerId.RightRing,
    name: 'Ngón áp út phải',
    shortName: 'Áp út phải',
    hand: 'Tay phải',
    homeKey: 'L',
    accentBg: 'bg-orange-600',
    accentBorder: 'border-orange-500',
    accentText: 'text-orange-700',
    keyTint: 'bg-orange-50/70 border-orange-200 text-orange-950',
    svgFill: '#EA580C',
  },
  [FingerId.RightPinky]: {
    id: FingerId.RightPinky,
    name: 'Ngón út phải',
    shortName: 'Út phải',
    hand: 'Tay phải',
    homeKey: ';',
    accentBg: 'bg-violet-600',
    accentBorder: 'border-violet-500',
    accentText: 'text-violet-700',
    keyTint: 'bg-violet-50/70 border-violet-200 text-violet-950',
    svgFill: '#7C3AED',
  },
};

export const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { code: 'Backquote', label: '`', shiftLabel: '~', finger: FingerId.LeftPinky, matchChars: ['`', '~'] },
    { code: 'Digit1', label: '1', shiftLabel: '!', finger: FingerId.LeftPinky, matchChars: ['1', '!'] },
    { code: 'Digit2', label: '2', shiftLabel: '@', finger: FingerId.LeftRing, matchChars: ['2', '@'] },
    { code: 'Digit3', label: '3', shiftLabel: '#', finger: FingerId.LeftMiddle, matchChars: ['3', '#'] },
    { code: 'Digit4', label: '4', shiftLabel: '$', finger: FingerId.LeftIndex, matchChars: ['4', '$'] },
    { code: 'Digit5', label: '5', shiftLabel: '%', finger: FingerId.LeftIndex, matchChars: ['5', '%'] },
    { code: 'Digit6', label: '6', shiftLabel: '^', finger: FingerId.RightIndex, matchChars: ['6', '^'] },
    { code: 'Digit7', label: '7', shiftLabel: '&', finger: FingerId.RightIndex, matchChars: ['7', '&'] },
    { code: 'Digit8', label: '8', shiftLabel: '*', finger: FingerId.RightMiddle, matchChars: ['8', '*'] },
    { code: 'Digit9', label: '9', shiftLabel: '(', finger: FingerId.RightRing, matchChars: ['9', '('] },
    { code: 'Digit0', label: '0', shiftLabel: ')', finger: FingerId.RightPinky, matchChars: ['0', ')'] },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: FingerId.RightPinky, matchChars: ['-', '_'] },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: FingerId.RightPinky, matchChars: ['=', '+'] },
    { code: 'Backspace', label: ' xóa', finger: FingerId.RightPinky, width: 2 },
  ],
  [
    { code: 'Tab', label: 'Tab', finger: FingerId.LeftPinky, width: 1.5 },
    { code: 'KeyQ', label: 'Q', finger: FingerId.LeftPinky, matchChars: ['q', 'Q'] },
    { code: 'KeyW', label: 'W', finger: FingerId.LeftRing, matchChars: ['w', 'W', 'ư', 'Ư', 'ă', 'Ă'] },
    { code: 'KeyE', label: 'E', finger: FingerId.LeftMiddle, matchChars: ['e', 'E', 'ê', 'Ê'] },
    { code: 'KeyR', label: 'R', finger: FingerId.LeftIndex, matchChars: ['r', 'R'] },
    { code: 'KeyT', label: 'T', finger: FingerId.LeftIndex, matchChars: ['t', 'T'] },
    { code: 'KeyY', label: 'Y', finger: FingerId.RightIndex, matchChars: ['y', 'Y', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ'] },
    { code: 'KeyU', label: 'U', finger: FingerId.RightIndex, matchChars: ['u', 'U', 'ư', 'Ư', 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'ừ', 'ứ', 'ử', 'ữ', 'ự'] },
    { code: 'KeyI', label: 'I', finger: FingerId.RightMiddle, matchChars: ['i', 'I', 'ì', 'í', 'ỉ', 'ĩ', 'ị'] },
    { code: 'KeyO', label: 'O', finger: FingerId.RightRing, matchChars: ['o', 'O', 'ô', 'Ô', 'ơ', 'Ơ', 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ'] },
    { code: 'KeyP', label: 'P', finger: FingerId.RightPinky, matchChars: ['p', 'P'] },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', finger: FingerId.RightPinky, matchChars: ['[', '{'] },
    { code: 'BracketRight', label: ']', shiftLabel: '}', finger: FingerId.RightPinky, matchChars: [']', '}'] },
    { code: 'Backslash', label: '\\', shiftLabel: '|', finger: FingerId.RightPinky, width: 1.5, matchChars: ['\\', '|'] },
  ],
  [
    { code: 'CapsLock', label: 'Caps', finger: FingerId.LeftPinky, width: 1.8 },
    { code: 'KeyA', label: 'A', finger: FingerId.LeftPinky, matchChars: ['a', 'A', 'ă', 'Ă', 'â', 'Â', 'à', 'á', 'ả', 'ã', 'ạ', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ'] },
    { code: 'KeyS', label: 'S', finger: FingerId.LeftRing, matchChars: ['s', 'S'] },
    { code: 'KeyD', label: 'D', finger: FingerId.LeftMiddle, matchChars: ['d', 'D', 'đ', 'Đ'] },
    { code: 'KeyF', label: 'F', finger: FingerId.LeftIndex, isHomeBump: true, matchChars: ['f', 'F'] },
    { code: 'KeyG', label: 'G', finger: FingerId.LeftIndex, matchChars: ['g', 'G'] },
    { code: 'KeyH', label: 'H', finger: FingerId.RightIndex, matchChars: ['h', 'H'] },
    { code: 'KeyJ', label: 'J', finger: FingerId.RightIndex, isHomeBump: true, matchChars: ['j', 'J'] },
    { code: 'KeyK', label: 'K', finger: FingerId.RightMiddle, matchChars: ['k', 'K'] },
    { code: 'KeyL', label: 'L', finger: FingerId.RightRing, matchChars: ['l', 'L'] },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: FingerId.RightPinky, matchChars: [';', ':'] },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: FingerId.RightPinky, matchChars: ["'", '"'] },
    { code: 'Enter', label: 'Enter', finger: FingerId.RightPinky, width: 2.2, matchChars: ['\n'] },
  ],
  [
    { code: 'ShiftLeft', label: 'Shift', finger: FingerId.LeftPinky, width: 2.3 },
    { code: 'KeyZ', label: 'Z', finger: FingerId.LeftPinky, matchChars: ['z', 'Z'] },
    { code: 'KeyX', label: 'X', finger: FingerId.LeftRing, matchChars: ['x', 'X'] },
    { code: 'KeyC', label: 'C', finger: FingerId.LeftMiddle, matchChars: ['c', 'C'] },
    { code: 'KeyV', label: 'V', finger: FingerId.LeftIndex, matchChars: ['v', 'V'] },
    { code: 'KeyB', label: 'B', finger: FingerId.LeftIndex, matchChars: ['b', 'B'] },
    { code: 'KeyN', label: 'N', finger: FingerId.RightIndex, matchChars: ['n', 'N'] },
    { code: 'KeyM', label: 'M', finger: FingerId.RightIndex, matchChars: ['m', 'M'] },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: FingerId.RightMiddle, matchChars: [',', '<'] },
    { code: 'Period', label: '.', shiftLabel: '>', finger: FingerId.RightRing, matchChars: ['.', '>'] },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: FingerId.RightPinky, matchChars: ['/', '?'] },
    { code: 'ShiftRight', label: 'Shift', finger: FingerId.RightPinky, width: 2.7 },
  ],
  [
    { code: 'ControlLeft', label: 'Ctrl', finger: FingerId.LeftPinky, width: 1.5 },
    { code: 'AltLeft', label: 'Alt', finger: FingerId.LeftPinky, width: 1.5 },
    { code: 'Space', label: 'Phím Cách (Space)', finger: FingerId.Thumb, width: 7, matchChars: [' '] },
    { code: 'AltRight', label: 'Alt', finger: FingerId.RightPinky, width: 1.5 },
    { code: 'ControlRight', label: 'Ctrl', finger: FingerId.RightPinky, width: 1.5 },
  ],
];

// Normalize Vietnamese characters to base Latin letter for finger guidance
function normalizeBaseChar(char: string): string {
  if (!char) return '';
  if (char === 'đ') return 'd';
  if (char === 'Đ') return 'D';
  return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const SHIFT_REQUIRED_CHARS = new Set([
  '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
  '{', '}', '|', ':', '"', '<', '>', '?',
]);

export interface ActiveKeyGuidance {
  primaryKey: KeyDef | null;
  shiftCode: 'ShiftLeft' | 'ShiftRight' | null;
  finger: FingerInfo | null;
  telexHint: string | null;
}

const TELEX_HINTS: Record<string, string> = {
  'ă': 'Gõ aw', 'â': 'Gõ aa', 'đ': 'Gõ dd', 'ê': 'Gõ ee', 'ô': 'Gõ oo', 'ơ': 'Gõ ow', 'ư': 'Gõ uw',
  'á': 'Dấu sắc: s', 'à': 'Dấu huyền: f', 'ả': 'Dấu hỏi: r', 'ã': 'Dấu ngã: x', 'ạ': 'Dấu nặng: j',
  'ắ': 'aw + s', 'ằ': 'aw + f', 'ẳ': 'aw + r', 'ẵ': 'aw + x', 'ặ': 'aw + j',
  'ấ': 'aa + s', 'ầ': 'aa + f', 'ẩ': 'aa + r', 'ẫ': 'aa + x', 'ậ': 'aa + j',
  'ế': 'ee + s', 'ề': 'ee + f', 'ể': 'ee + r', 'ễ': 'ee + x', 'ệ': 'ee + j',
  'ố': 'oo + s', 'ồ': 'oo + f', 'ổ': 'oo + r', 'ỗ': 'oo + x', 'ộ': 'oo + j',
  'ớ': 'ow + s', 'ờ': 'ow + f', 'ở': 'ow + r', 'ỡ': 'ow + x', 'ợ': 'ow + j',
  'ứ': 'uw + s', 'ừ': 'uw + f', 'ử': 'uw + r', 'ữ': 'uw + x', 'ự': 'uw + j',
  'é': 'e + s', 'è': 'e + f', 'ẻ': 'e + r', 'ẽ': 'e + x', 'ẹ': 'e + j',
  'í': 'i + s', 'ì': 'i + f', 'ỉ': 'i + r', 'ĩ': 'i + x', 'ị': 'i + j',
  'ó': 'o + s', 'ò': 'o + f', 'ỏ': 'o + r', 'õ': 'o + x', 'ọ': 'o + j',
  'ú': 'u + s', 'ù': 'u + f', 'ủ': 'u + r', 'ũ': 'u + x', 'ụ': 'u + j',
  'ý': 'y + s', 'ỳ': 'y + f', 'ỷ': 'y + r', 'ỹ': 'y + x', 'ỵ': 'y + j',
};

export function getGuidanceForChar(char: string): ActiveKeyGuidance {
  if (!char) {
    return { primaryKey: null, shiftCode: null, finger: null, telexHint: null };
  }

  const lowerOriginal = char.toLowerCase();
  const telexHint = TELEX_HINTS[lowerOriginal] || null;
  const baseChar = normalizeBaseChar(char);

  let foundKey: KeyDef | null = null;

  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.matchChars && (key.matchChars.includes(char) || key.matchChars.includes(baseChar))) {
        foundKey = key;
        break;
      }
    }
    if (foundKey) break;
  }

  if (!foundKey) {
    return { primaryKey: null, shiftCode: null, finger: null, telexHint };
  }

  const isUpperAlpha = baseChar.length === 1 && baseChar >= 'A' && baseChar <= 'Z';
  const needsShift = isUpperAlpha || SHIFT_REQUIRED_CHARS.has(char);

  let shiftCode: 'ShiftLeft' | 'ShiftRight' | null = null;
  if (needsShift) {
    const fingerInfo = FINGER_INFO[foundKey.finger];
    shiftCode = fingerInfo.hand === 'Tay trái' ? 'ShiftRight' : 'ShiftLeft';
  }

  return {
    primaryKey: foundKey,
    shiftCode,
    finger: FINGER_INFO[foundKey.finger],
    telexHint,
  };
}
