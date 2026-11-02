export interface SubtitleLineItem {
  text: string;
  translation: string;
  timestampSec: number;
}

export interface SubtitleTrack {
  id: string;
  title: string;
  artist: string;
  totalDurationSec: number;
  primaryLang: 'vi' | 'en';
  lines: SubtitleLineItem[];
}

export const SUBTITLE_TRACKS: SubtitleTrack[] = [
  {
    id: 'track-love-stays',
    title: 'Mà Tình Yêu Vẫn Ở Đây (Acoustic)',
    artist: 'Bản dịch Song ngữ Việt - Anh',
    totalDurationSec: 259, // 04:19 matching reference screenshot
    primaryLang: 'vi',
    lines: [
      {
        text: 'Chiều buông nắng nhẹ trên con dốc dài.',
        translation: 'Afternoon sunlight gently fades along the long slope.',
        timestampSec: 14,
      },
      {
        text: 'Những cơn gió thu khẽ chạm qua vai.',
        translation: 'Autumn breezes softly brush past my shoulder.',
        timestampSec: 32,
      },
      {
        text: 'Thời gian trôi nhanh như mây cuối trời.',
        translation: 'Time drifts swiftly like clouds at the horizon.',
        timestampSec: 54,
      },
      {
        text: 'Đôi khi lòng quên mất câu trả lời.',
        translation: 'Sometimes the heart forgets the answer it sought.',
        timestampSec: 79,
      },
      {
        text: 'Đi qua bao mùa mưa nắng đổi thay.',
        translation: 'Walking through countless changing seasons of rain and sun.',
        timestampSec: 112,
      },
      {
        text: 'Giữ lại bình yên trong từng phút giây.',
        translation: 'Keeping serenity alive inside every passing moment.',
        timestampSec: 156,
      },
      {
        text: 'Dẫu cho ngày mai muôn lối xa xôi.',
        translation: 'Even if tomorrow leads down distant paths.',
        timestampSec: 198,
      },
      {
        text: 'Mà tình yêu vẫn ở đây thôi.',
        translation: 'Yet love is right here all along.',
        timestampSec: 229, // 03:49 / 04:19 matching reference screenshot!
      },
    ],
  },
  {
    id: 'track-hanoi-autumn',
    title: 'Gió Mùa Thu Hà Nội',
    artist: 'Tản văn & Giai điệu Song ngữ',
    totalDurationSec: 215,
    primaryLang: 'vi',
    lines: [
      {
        text: 'Sáng sớm phố cổ thơm mùi cốm mới.',
        translation: 'Early morning in the Old Quarter smells of fresh green rice.',
        timestampSec: 18,
      },
      {
        text: 'Từng chiếc lá vàng rơi nghiêng bên thềm.',
        translation: 'Golden leaves drift softly beside the doorstep.',
        timestampSec: 45,
      },
      {
        text: 'Tách cà phê nóng sưởi ấm đôi bàn tay.',
        translation: 'A warm cup of coffee comforts both hands.',
        timestampSec: 82,
      },
      {
        text: 'Nhịp phím lướt êm theo từng dòng suy nghĩ.',
        translation: 'Keystrokes glide smoothly alongside every stream of thought.',
        timestampSec: 124,
      },
      {
        text: 'Bình yên bắt đầu từ những điều giản dị nhất.',
        translation: 'Peace begins with the simplest things in life.',
        timestampSec: 176,
      },
    ],
  },
  {
    id: 'track-english-cinema',
    title: 'Before Sunrise — Cinema Quotes',
    artist: 'Luyện gõ Tiếng Anh - Phụ đề Việt',
    totalDurationSec: 190,
    primaryLang: 'en',
    lines: [
      {
        text: 'Every great journey begins with a single quiet step.',
        translation: 'Mọi hành trình vĩ đại đều khởi đầu từ một bước chân lặng lẽ.',
        timestampSec: 20,
      },
      {
        text: 'Listen closely to the rhythm of your own thoughts.',
        translation: 'Hãy lắng nghe thật kỹ nhịp điệu trong suy nghĩ của chính bạn.',
        timestampSec: 56,
      },
      {
        text: 'Consistency turns small daily habits into mastery.',
        translation: 'Sự kiên trì biến những thói quen nhỏ mỗi ngày thành sự tinh thông.',
        timestampSec: 98,
      },
      {
        text: 'Everything we truly cherish stays warm in memory.',
        translation: 'Mọi điều ta thực sự trân quý đều giữ nguyên hơi ấm trong ký ức.',
        timestampSec: 142,
      },
      {
        text: 'Yet love is right here all along.',
        translation: 'Mà tình yêu vẫn ở đây thôi.',
        timestampSec: 178,
      },
    ],
  },
];
