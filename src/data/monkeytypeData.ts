import { MonkeyThemeDef, MonkeyThemeId, MonkeyLanguage, MonkeyModeType } from '../types';

export const MONKEY_THEMES: Record<MonkeyThemeId, MonkeyThemeDef> = {
  serika_dark: {
    id: 'serika_dark',
    name: 'Serika Dark',
    bgColor: '#323437',
    mainColor: '#e2b714',
    subColor: '#646669',
    textColor: '#d1d0c5',
    errorColor: '#ca4754',
    errorExtraColor: '#7e2a33',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    bgColor: '#282a36',
    mainColor: '#bd93f9',
    subColor: '#6272a4',
    textColor: '#f8f8f2',
    errorColor: '#ff5555',
    errorExtraColor: '#b52a2a',
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    bgColor: '#2e3440',
    mainColor: '#88c0d0',
    subColor: '#4c566a',
    textColor: '#d8dee9',
    errorColor: '#bf616a',
    errorExtraColor: '#793e44',
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon',
    bgColor: '#1f1f1f',
    mainColor: '#f66e0d',
    subColor: '#555555',
    textColor: '#cccccc',
    errorColor: '#e03131',
    errorExtraColor: '#8a1d1d',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    bgColor: '#0d1117',
    mainColor: '#00ff66',
    subColor: '#238636',
    textColor: '#7ee787',
    errorColor: '#da3633',
    errorExtraColor: '#8b1e1b',
  },
  chalk: {
    id: 'chalk',
    name: 'Chalk Paper',
    bgColor: '#f5f5f5',
    mainColor: '#0284c7',
    subColor: '#94a3b8',
    textColor: '#1e293b',
    errorColor: '#e11d48',
    errorExtraColor: '#9f1239',
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    bgColor: '#241b2f',
    mainColor: '#f38ba8',
    subColor: '#6c7086',
    textColor: '#cdd6f4',
    errorColor: '#eba0ac',
    errorExtraColor: '#783845',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bgColor: '#181528',
    mainColor: '#00f0ff',
    subColor: '#711c91',
    textColor: '#ffff00',
    errorColor: '#ff0055',
    errorExtraColor: '#8a002e',
  },
};

export const VI_WORDS_200 = [
  'và', 'là', 'người', 'trong', 'một', 'có', 'các', 'được', 'không', 'với',
  'những', 'này', 'khi', 'cho', 'đến', 'từ', 'sẽ', 'đã', 'tại', 'như',
  'để', 'về', 'của', 'ra', 'vào', 'năm', 'nhiều', 'ngày', 'theo', 'họ',
  'cũng', 'lại', 'thì', 'ở', 'sau', 'nói', 'làm', 'phải', 'biết', 'thấy',
  'đi', 'còn', 'việc', 'đang', 'trên', 'qua', 'nhưng', 'chỉ', 'mình', 'lớn',
  'tháng', 'thời', 'gian', 'nhà', 'trường', 'mới', 'bằng', 'chúng', 'ta', 'nơi',
  'rất', 'trước', 'nước', 'đầu', 'con', 'khác', 'hai', 'ba', 'cả', 'thể',
  'bởi', 'vì', 'cần', 'thế', 'giới', 'cuộc', 'sống', 'tốt', 'đẹp', 'lên',
  'xuống', 'lấy', 'đưa', 'mang', 'giữ', 'nghe', 'nhìn', 'học', 'hỏi', 'hiểu',
  'viết', 'đọc', 'nghĩ', 'yêu', 'thương', 'nhớ', 'quên', 'chờ', 'đợi', 'tìm',
  'kiếm', 'gặp', 'quen', 'bạn', 'bè', 'gia', 'đình', 'anh', 'em', 'cha',
  'mẹ', 'ông', 'bà', 'con', 'cháu', 'đất', 'trời', 'mây', 'gió', 'mưa',
  'nắng', 'biển', 'núi', 'sông', 'rừng', 'cây', 'hoa', 'lá', 'trái', 'đường',
  'phố', 'làng', 'quê', 'hương', 'tổ', 'quốc', 'đồng', 'bào', 'tiếng', 'nói',
  'chữ', 'nghĩa', 'sách', 'vở', 'bút', 'mực', 'bàn', 'ghế', 'đèn', 'điện',
  'máy', 'tính', 'công', 'nghệ', 'khoa', 'học', 'kỹ', 'thuật', 'tương', 'lai',
  'hiện', 'tại', 'quá', 'khứ', 'bước', 'chân', 'bàn', 'tay', 'khéo', 'léo',
  'nhanh', 'nhẹn', 'chính', 'xác', 'kiên', 'trì', 'bền', 'bỉ', 'tập', 'luyện',
  'tiến', 'bộ', 'thành', 'công', 'vui', 'vẻ', 'hạnh', 'phúc', 'bình', 'an',
  'tâm', 'hồn', 'trí', 'tuệ', 'sáng', 'tạo', 'ước', 'mơ', 'khát', 'vọng',
];

export const VI_WORDS_1K = [
  ...VI_WORDS_200,
  'phát', 'triển', 'kinh', 'tế', 'thị', 'trường', 'doanh', 'nghiệp', 'đầu', 'tư',
  'sản', 'xuất', 'kinh', 'doanh', 'dịch', 'vụ', 'thương', 'mại', 'tài', 'chính',
  'ngân', 'hàng', 'tiền', 'tệ', 'giá', 'trị', 'chất', 'lượng', 'hiệu', 'quả',
  'quản', 'lý', 'điều', 'hành', 'chiến', 'lược', 'kế', 'hoạch', 'mục', 'tiêu',
  'nhiệm', 'vụ', 'giải', 'pháp', 'thực', 'hiện', 'hoàn', 'thành', 'kết', 'quả',
  'nghiên', 'cứu', 'ứng', 'dụng', 'chuyển', 'đổi', 'số', 'dữ', 'liệu', 'thông',
  'tin', 'truyền', 'thông', 'mạng', 'internet', 'trí', 'tuệ', 'nhân', 'tạo',
  'học', 'máy', 'thuật', 'toán', 'phần', 'mềm', 'hệ', 'thống', 'bảo', 'mật',
  'an', 'ninh', 'quốc', 'phòng', 'chính', 'sách', 'pháp', 'luật', 'quy', 'định',
  'tiêu', 'chuẩn', 'trách', 'nhiệm', 'nghĩa', 'vụ', 'quyền', 'lợi', 'cộng',
  'đồng', 'xã', 'hội', 'môi', 'trường', 'sinh', 'thái', 'khí', 'hậu', 'năng',
  'lượng', 'tái', 'tạo', 'bảo', 'vệ', 'tài', 'nguyên', 'thiên', 'nhiên', 'văn',
  'hóa', 'nghệ', 'thuật', 'di', 'sản', 'truyền', 'thống', 'lịch', 'sử', 'tinh',
  'thần', 'đoàn', 'kết', 'nhân', 'ái', 'bao', 'dung', 'tự', 'hào', 'dân',
  'tộc', 'hội', 'nhập', 'quốc', 'tế', 'hợp', 'tác', 'hữu', 'nghị', 'hòa',
  'bình', 'ổn', 'định', 'bền', 'vững', 'phồn', 'vinh', 'thịnh', 'vượng', 'vươn',
];

export const VI_QUOTES = [
  {
    length: 'short',
    text: 'Học, học nữa, học mãi để làm chủ tri thức và mở ra tương lai.',
    author: 'V.I. Lênin',
  },
  {
    length: 'short',
    text: 'Không có việc gì khó, chỉ sợ lòng không bền, đào núi và lấp biển, quyết chí ắt làm nên.',
    author: 'Hồ Chí Minh',
  },
  {
    length: 'short',
    text: 'Gần mực thì đen, gần đèn thì rạng.',
    author: 'Tục ngữ Việt Nam',
  },
  {
    length: 'medium',
    text: 'Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra. Một lòng thờ mẹ kính cha, cho tròn chữ hiếu mới là đạo con.',
    author: 'Ca dao Việt Nam',
  },
  {
    length: 'medium',
    text: 'Nhiễu điều phủ lấy giá gương, người trong một nước phải thương nhau cùng. Bầu ơi thương lấy bí cùng, tuy rằng khác giống nhưng chung một giàn.',
    author: 'Ca dao Việt Nam',
  },
  {
    length: 'medium',
    text: 'Muốn biết phải hỏi, muốn giỏi phải học. Kiến tha lâu cũng đầy tổ, nước chảy đá cũng mòn theo năm tháng rèn luyện.',
    author: 'Tục ngữ Việt Nam',
  },
  {
    length: 'long',
    text: 'Trời có bốn mùa: Xuân, Hạ, Thu, Đông. Đất có bốn phương: Đông, Tây, Nam, Bắc. Người có bốn đức: Cần, Kiệm, Liêm, Chính. Thiếu một mùa thì không thành trời. Thiếu một phương thì không thành đất. Thiếu một đức thì không thành người.',
    author: 'Hồ Chí Minh',
  },
  {
    length: 'long',
    text: 'Sự kiên nhẫn và đều đặn trong việc luyện gõ mười ngón mỗi ngày sẽ giúp các ngón tay tự do lướt trên bàn phím như những nốt nhạc, giải phóng hoàn toàn tâm trí để bạn tập trung trọn vẹn vào dòng chảy suy nghĩ và sáng tạo.',
    author: 'Mười Ngón',
  },
];

export const EN_WORDS_200 = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'code', 'speed', 'flow', 'hand', 'type', 'light', 'focus', 'clean', 'simple',
  'learn', 'fast', 'smart', 'world', 'power', 'mind', 'key', 'press', 'rhythm', 'sound',
  'build', 'space', 'shift', 'enter', 'right', 'left', 'habit', 'skill', 'future', 'dream',
];

export const EN_WORDS_1K = [
  ...EN_WORDS_200,
  'system', 'program', 'function', 'variable', 'constant', 'object', 'array', 'string',
  'number', 'boolean', 'promise', 'async', 'await', 'import', 'export', 'default',
  'return', 'switch', 'break', 'continue', 'interface', 'component', 'element', 'document',
  'window', 'browser', 'server', 'database', 'network', 'request', 'response', 'status',
  'header', 'payload', 'execute', 'process', 'memory', 'thread', 'render', 'update',
  'effect', 'state', 'reduce', 'filter', 'iterate', 'pointer', 'reference', 'garbage',
  'collection', 'runtime', 'compile', 'bundle', 'optimize', 'deploy', 'monitor', 'action',
];

export const CODE_SNIPPETS = [
  'const calculateWpm = (chars, seconds) => Math.round((chars / 5) / (seconds / 60));',
  'export function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }',
  'const [state, setState] = useState({ wpm: 0, accuracy: 100, activeKey: null });',
  'async function fetchData(url) { const res = await fetch(url); return res.ok ? res.json() : null; }',
  'const filtered = items.filter(item => item.isActive).map(x => x.name.trim().toLowerCase());',
  'useEffect(() => { const onKey = (e) => handleKey(e); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);',
];

export interface GenerateMonkeyOptions {
  mode: MonkeyModeType;
  timeSec: number;
  wordCount: number;
  quoteLength: 'short' | 'medium' | 'long' | 'all';
  punctuation: boolean;
  numbers: boolean;
  language: MonkeyLanguage;
}

export function generateMonkeyWords(options: GenerateMonkeyOptions): string[] {
  const { mode, wordCount, quoteLength, punctuation, numbers, language } = options;

  if (mode === 'quote') {
    const list = VI_QUOTES.filter(
      (q) => quoteLength === 'all' || q.length === quoteLength
    );
    const chosen = list[Math.floor(Math.random() * list.length)] || VI_QUOTES[0];
    return chosen.text.split(' ');
  }

  let baseWords: string[] = [];
  if (language === 'vi_200') baseWords = VI_WORDS_200;
  else if (language === 'vi_1k') baseWords = VI_WORDS_1K;
  else if (language === 'vi_cadao') {
    const quoteWords = VI_QUOTES.map((q) => q.text.split(' ')).flat();
    baseWords = quoteWords;
  } else if (language === 'en_200') baseWords = EN_WORDS_200;
  else if (language === 'en_1k') baseWords = EN_WORDS_1K;
  else if (language === 'code') {
    const snippetWords = CODE_SNIPPETS.map((s) => s.split(' ')).flat();
    baseWords = snippetWords;
  } else {
    baseWords = VI_WORDS_200;
  }

  // Determine needed quantity
  const targetCount =
    mode === 'words'
      ? wordCount
      : mode === 'time'
        ? Math.max(80, Math.ceil(options.timeSec * 3.5))
        : 120; // zen or custom

  const generated: string[] = [];
  const punctuationMarks = ['.', ',', '!', '?', ';', ':', '"', '...'];

  for (let i = 0; i < targetCount; i++) {
    // Inject random number if numbers enabled and random chance
    if (numbers && Math.random() < 0.12) {
      const num = Math.floor(Math.random() * 999) + 1;
      generated.push(String(num));
      continue;
    }

    const randomWord = baseWords[Math.floor(Math.random() * baseWords.length)];
    let word = randomWord;

    if (punctuation && language !== 'code') {
      // Capitalize first word or sentence starter
      if (i === 0 || (i > 0 && ['.', '!', '?'].some((mark) => generated[i - 1]?.endsWith(mark)))) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Add punctuation mark occasionally
      if (Math.random() < 0.16 && i < targetCount - 1) {
        const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        if (mark === '"') {
          word = `"${word}"`;
        } else {
          word = `${word}${mark}`;
        }
      }
    }

    generated.push(word);
  }

  return generated;
}
