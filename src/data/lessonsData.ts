import { Lesson, LessonCategory } from '../types';

export const LESSONS: Lesson[] = [
  // 1. HÀNG PHÍM CƠ SỞ (HOME ROW)
  {
    id: 'home-1',
    number: '01',
    title: 'Phím chuẩn F và J (Hai ngón trỏ)',
    category: LessonCategory.HomeRow,
    focusKeys: ['F', 'J', 'Space'],
    targetWpm: 20,
    targetAccuracy: 94,
    description: 'Đặt hai ngón trỏ lên phím F và J có gờ nổi định vị, dùng ngón cái ấn nhẹ phím Cách.',
    exercises: [
      'fff jjj fff jjj ff jj ff jj fj fj jf jf fff jjj fjf jfj ffj jjf fjf jfj',
      'fj jf ffj jjf fjfj jfjf fff jjj fjf jfj ff jj fj jf fjjf jffj fjfj jfjf',
      'f j ff jj fjf jfj fjj jff fjfj jfjf fff jjj fj jf ffjj jjff fjf jfj ffj',
    ],
  },
  {
    id: 'home-2',
    number: '02',
    title: 'Mở rộng D và K (Hai ngón giữa)',
    category: LessonCategory.HomeRow,
    focusKeys: ['D', 'K', 'F', 'J'],
    targetWpm: 22,
    targetAccuracy: 94,
    description: 'Kết hợp ngón giữa trái (D) và ngón giữa phải (K), giữ cổ tay thẳng và thả lỏng.',
    exercises: [
      'ddd kkk ddd kkk dd kk dk kd df jk fd kj dfd kjk fdk jkd dfjk kjfd dkf jfd',
      'dk kd fdk jkd dfjk kjfd ddf kkj fdd jkk dkdk kdkd dfk kjd fjdk dkfj dfjk',
      'fd jk df kj ddd kkk fdf jkj dkf jfd fkdj jdkf dfjk kjfd ddkk ffjj dkfj',
    ],
  },
  {
    id: 'home-3',
    number: '03',
    title: 'Phím S và L (Hai ngón áp út)',
    category: LessonCategory.HomeRow,
    focusKeys: ['S', 'L', 'D', 'K', 'F', 'J'],
    targetWpm: 24,
    targetAccuracy: 93,
    description: 'Luyện sự độc lập của hai ngón áp út với phím S và L trên hàng cơ sở.',
    exercises: [
      'sss lll sss lll ss ll sl ls sd kl ds lk sdf jkl fds lkj sldk kdls sdfj jklf',
      'sl ls sdl klf fds lkj skdl ldks sldf jklf ssdd kkll sdf jkl fds lkj sldk',
      'skd ldf jks fld sdf jkl lkj fds slsl lsls sdkf jklf dslf kjds sdfjkl lkjfds',
    ],
  },
  {
    id: 'home-4',
    number: '04',
    title: 'Phím A và ; (Hai ngón út)',
    category: LessonCategory.HomeRow,
    focusKeys: ['A', ';', 'S', 'L', 'D', 'K', 'F', 'J'],
    targetWpm: 25,
    targetAccuracy: 92,
    description: 'Hoàn thiện 8 phím neo của hàng cơ sở với ngón út trái (A) và ngón út phải (;).',
    exercises: [
      'aaa ;;; aaa ;;; as l; sa ;l asdf jkl; fdsa ;lkj ask; ;ksa sad; lad; fads;',
      'asdf jkl; asdf jkl; fdsa ;lkj sad dad lad ask fall all flask salad;',
      'all sad lads ask dad; a lass falls; add a salad flask; asdf ;lkj fdsa jkl;',
    ],
  },
  {
    id: 'home-5',
    number: '05',
    title: 'Phím G và H (Vươn ngón trỏ)',
    category: LessonCategory.HomeRow,
    focusKeys: ['G', 'H', 'F', 'J', 'A', 'S', 'D', 'K', 'L'],
    targetWpm: 28,
    targetAccuracy: 93,
    description: 'Từ F vươn sang G, từ J vươn sang H rồi thu ngón trỏ về ngay vị trí gờ nổi ban đầu.',
    exercises: [
      'fgf jhj fgf jhj gg hh gh hg fgh jhg gfd hjk glad half hash flag dash hall',
      'glass flash shall laugh half glad flags; dad has a glass flask; a glad hall;',
      'ash dash gash hash lash; half a glass; glad lads laugh; fgf jhj asdfg hjkl;',
    ],
  },

  // 2. HÀNG PHÍM TRÊN (TOP ROW)
  {
    id: 'top-1',
    number: '06',
    title: 'Phím R, U và E, I',
    category: LessonCategory.TopRow,
    focusKeys: ['R', 'U', 'E', 'I'],
    targetWpm: 28,
    targetAccuracy: 93,
    description: 'Vươn ngón trỏ và ngón giữa lên hàng phím trên để gõ các nguyên âm và phụ âm phổ biến.',
    exercises: [
      'frf juj ded kik frf juj ded kik red ridika fur fire sure ride user free',
      'ireland desire figure guideisure; read a free guide; sure fire user ride',
      'fried driedesk riderisk; fresh air fills dark hills; red jars full of figs',
    ],
  },
  {
    id: 'top-2',
    number: '07',
    title: 'Phím T, Y và W, O, Q, P',
    category: LessonCategory.TopRow,
    focusKeys: ['T', 'Y', 'W', 'O', 'Q', 'P'],
    targetWpm: 30,
    targetAccuracy: 92,
    description: 'Làm chủ toàn bộ hàng phím QWERTY phía trên để ghép từ hoàn chỉnh mượt mà.',
    exercises: [
      'ftf jyj sws lol aqa ;p; try top two power quote write quiet paper water',
      'proper power tower flower; write your top quote; quiet people work smart',
      'portrait priority airport support; type without looking down at your hands',
    ],
  },

  // 3. HÀNG PHÍM DƯỚI (BOTTOM ROW)
  {
    id: 'bottom-1',
    number: '08',
    title: 'Phím V, M, B, N (Ngón trỏ hàng dưới)',
    category: LessonCategory.BottomRow,
    focusKeys: ['V', 'B', 'N', 'M'],
    targetWpm: 30,
    targetAccuracy: 93,
    description: 'Di chuyển linh hoạt hai ngón trỏ xuống hàng dưới mà không nhấc toàn bộ bàn tay.',
    exercises: [
      'fvf jmj fbf jnj vbnm mnbv van man ban name move number never seven morning',
      'modern banner moment vibrant; seven brave men move heavy timber vans',
      'combine minimum number; remember every movement from home row keys',
    ],
  },
  {
    id: 'bottom-2',
    number: '09',
    title: 'Phím C, X, Z và dấu phẩy, dấu chấm',
    category: LessonCategory.BottomRow,
    focusKeys: ['C', 'X', 'Z', ',', '.', '/'],
    targetWpm: 32,
    targetAccuracy: 93,
    description: 'Hoàn thiện 26 chữ cái cùng dấu chấm, dấu phẩy để soạn thảo câu văn trọn vẹn.',
    exercises: [
      'dcd k,k sxs l.l aza ;/;aza zoom next civic, exact size, clear voice.',
      'pack my box with five dozen liquor jugs. the quick brown fox jumps over.',
      'focus, practice, relax. steady rhythm builds speed faster than rushing.',
    ],
  },

  // 4. CHỮ HOA & DẤU CÂU
  {
    id: 'shift-1',
    number: '10',
    title: 'Quy tắc phím Shift chéo tay & Chữ số',
    category: LessonCategory.NumbersShift,
    focusKeys: ['Shift', '1-9', '0', '!', '?'],
    targetWpm: 32,
    targetAccuracy: 92,
    description: 'Gõ chữ hoa bằng phím Shift của bàn tay đối diện để không làm lệch trục cổ tay.',
    exercises: [
      'Ha Noi, Da Nang, Sai Gon. Nam 2026 co 12 thang, 365 ngay va 24 gio!',
      'Quy tac 10 ngon: Tay trai go chu thi tay phai nhan Shift, va nguoc lai.',
      'Thoi gian luyen tap 15 phut moi ngay giup dat toc do 65 WPM sau 4 tuan?',
    ],
  },

  // 5. VĂN BẢN TIẾNG VIỆT (TELEX / UNICODE)
  {
    id: 'vi-1',
    number: '11',
    title: 'Từ vựng & Câu ngắn Tiếng Việt (Không dấu → Có dấu)',
    category: LessonCategory.VietnameseProse,
    focusKeys: ['ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư'],
    targetWpm: 35,
    targetAccuracy: 94,
    description: 'Bật bộ gõ tiếng Việt (Telex hoặc VNI) trên máy tính và luyện nhịp gõ dấu thanh tự nhiên.',
    exercises: [
      'mặt trời mọc ở đằng đông, chiếu ánh nắng ấm áp xuống cánh đồng lúa chín vàng.',
      'luyện gõ mười ngón giúp đôi tay lướt nhẹ trên bàn phím mà mắt vẫn nhìn màn hình.',
      'kiên trì rèn luyện mỗi ngày mười lăm phút sẽ tạo phản xạ cơ bắp bền vững.',
    ],
  },
  {
    id: 'vi-2',
    number: '12',
    title: 'Tục ngữ & Văn xuôi Việt Nam chọn lọc',
    category: LessonCategory.VietnameseProse,
    focusKeys: ['s', 'f', 'r', 'x', 'j'],
    targetWpm: 42,
    targetAccuracy: 95,
    description: 'Luyện tốc độ và độ chính xác với các câu ca dao, tục ngữ và đoạn văn tiếng Việt giàu thanh điệu.',
    exercises: [
      'Có công mài sắt, có ngày nên kim. Đi một ngày đàng, học một sàng khôn.',
      'Mùa thu Hà Nội mang theo hương cốm mới dịu nhẹ và làn gió heo may se lạnh trên từng con phố nhỏ.',
      'Khi bạn giữ đúng tư thế lưng thẳng, cổ tay thả lỏng và ánh mắt hướng thẳng về phía trước, tốc độ gõ sẽ tự nhiên tăng vọt.',
    ],
  },

  // 6. TIẾNG ANH & LẬP TRÌNH
  {
    id: 'en-code-1',
    number: '13',
    title: 'Đoạn văn Tiếng Anh thông dụng',
    category: LessonCategory.EnglishCode,
    focusKeys: ['A-Z', '.', ','],
    targetWpm: 45,
    targetAccuracy: 95,
    description: 'Rèn nhịp gõ đều đặn với các cụm từ tiếng Anh tần suất cao trong công việc quốc tế.',
    exercises: [
      'Touch typing is all about muscle memory. Accuracy always comes first, and speed follows naturally over time.',
      'Great craftsmanship lies in calm focus, steady rhythm, and deliberate daily practice without looking at the keys.',
      'Design is not just what it looks like and feels like. Design is how well it works in everyday life.',
    ],
  },
  {
    id: 'en-code-2',
    number: '14',
    title: 'Ký hiệu Lập trình & Cú pháp Code',
    category: LessonCategory.EnglishCode,
    focusKeys: ['(', ')', '{', '}', '=', ';', '>'],
    targetWpm: 35,
    targetAccuracy: 92,
    description: 'Luyện ngón út phải với các dấu ngoặc nhọn, ngoặc tròn, dấu bằng và mũi tên trong lập trình.',
    exercises: [
      'const calcWpm = (chars, sec) => Math.round((chars / 5) / (sec / 60));',
      'function formatScore(wpm, acc) { return `${wpm} WPM (${acc}%)`; }',
      'const items = data.filter((row) => row.active && row.score >= 95);',
    ],
  },
];

export const TIMED_PASSAGES = {
  vi: [
    'Gõ bàn phím bằng mười ngón tay là một kỹ năng nền tảng trong thời đại số. Thay vì dùng hai hoặc bốn ngón và liên tục cúi xuống nhìn bàn phím, người gõ mười ngón phân chia nhiệm vụ rõ ràng cho từng ngón tay dựa trên hàng phím cơ sở. Hai gờ nổi nhỏ trên phím F và phím J đóng vai trò như mỏ neo xúc giác, giúp bàn tay luôn tìm về đúng vị trí xuất phát chỉ trong tích tắc. Khi mới bắt đầu, việc gõ chậm lại để giữ độ chính xác trên chín mươi lăm phần trăm quan trọng hơn rất nhiều so với việc cố gõ thật nhanh nhưng sai lỗi liên tục.',
    'Buổi sáng sớm tại cao nguyên Lâm Viên bắt đầu bằng lớp sương mỏng phủ nhẹ trên những đồi thông xanh thẫm. Khi những tia nắng đầu tiên xuyên qua tán lá, không khí trong lành mang theo mùi nhựa thông và hương cà phê rang mới từ những quán nhỏ ven đường. Nhịp sống nơi đây diễn ra chậm rãi, điềm tĩnh và cân bằng, giống hệt như nhịp điệu đều đặn của những ngón tay đang lướt êm trên từng hàng phím cơ học.',
    'Khoa học thần kinh chỉ ra rằng trí nhớ cơ bắp hình thành hiệu quả nhất thông qua các phiên luyện tập ngắn nhưng đều đặn mỗi ngày. Chỉ cần dành mười lăm đến hai mươi phút tập trung tuyệt đối, não bộ sẽ củng cố các đường dẫn truyền thần kinh điều khiển từng đốt ngón tay. Sau khoảng hai đến ba tuần kiên trì, bạn sẽ nhận ra mình có thể vừa suy nghĩ ý tưởng vừa chuyển hóa thành dòng chữ mạch lạc mà không còn bất kỳ rào cản cơ học nào.',
  ],
  en: [
    'Learning to touch type with all ten fingers transforms how you interact with a computer. Instead of hunting for individual letters and splitting your attention between the keyboard and the display, your thoughts flow directly onto the screen. Start by resting your index fingers lightly on the tactile bumps of F and J, keep your wrists neutral, and focus entirely on clean, accurate keystrokes. Speed is simply a byproduct of precision.',
    'Deliberate practice differs from mindless repetition because it targets your specific weak spots. Whenever a particular finger hesitates on top row or bottom row transitions, slow down your tempo until every movement feels effortless and smooth. Consistent rhythm across common letter pairs builds lasting confidence for writing essays, reports, and software code.',
  ],
  viNoTone: [
    'Luyen go muoi ngon tay khong he kho neu ban tuan thu dung nguyen tac vi tri ngon ngay tu ngay dau tien. Hay dat nhe tam ngon tay len hang phim co so ASDF va JKL;, hai ngon cai dat tren phim Cach. Moi khi mot ngon tay vuon len hang tren hoac xuong hang duoi de bam phim, hay dua ngon tay do tro ve dung vi tri neo ban dau.',
  ],
};
