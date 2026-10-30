import React from 'react';
import { FINGER_INFO } from '../data/keyboardData';
import { FingerId } from '../types';

const ORDERED_FINGERS: { id: FingerId; keys: string }[] = [
  { id: FingerId.LeftPinky, keys: '1, Q, A, Z, Shift trái' },
  { id: FingerId.LeftRing, keys: '2, W, S, X' },
  { id: FingerId.LeftMiddle, keys: '3, E, D, C' },
  { id: FingerId.LeftIndex, keys: '4, 5, R, T, F, G, V, B' },
  { id: FingerId.Thumb, keys: 'Phím Cách (Spacebar)' },
  { id: FingerId.RightIndex, keys: '6, 7, Y, U, H, J, N, M' },
  { id: FingerId.RightMiddle, keys: '8, I, K, dấu phẩy (,)' },
  { id: FingerId.RightRing, keys: '9, O, L, dấu chấm (.)' },
  { id: FingerId.RightPinky, keys: '0, -, =, P, [, ], ;, \', /, Enter, Shift phải' },
];

export const FingerGuideSection: React.FC = () => {
  return (
    <section id="nguyen-tac" className="py-14 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
            Quy tắc vàng để gõ 10 ngón chuẩn xác và không mỏi cổ tay
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Nắm vững tư thế ngồi và phạm vi phụ trách của từng ngón tay giúp bạn tăng gấp đôi tốc độ soạn thảo chỉ sau 2 tuần rèn luyện đều đặn.
          </p>
        </div>

        {/* 3 Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-2.5">
            <h3 className="text-lg font-semibold text-slate-900">
              01. Neo xúc giác tại phím F và J
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trên mọi bàn phím tiêu chuẩn, hai phím <strong>F</strong> và <strong>J</strong> đều có gờ nổi nhỏ. Hãy đặt nhẹ hai ngón trỏ lên đó để định vị toàn bộ 8 ngón tay trên hàng cơ sở (A S D F — J K L ;) mà không cần nhìn xuống.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-2.5">
            <h3 className="text-lg font-semibold text-slate-900">
              02. Vươn ngón và thu về ngay lập tức
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Khi cần bấm phím ở hàng trên (Q W E R T Y...) hoặc hàng dưới (Z X C V B...), chỉ vươn đúng ngón tay được phân công rồi thu ngón về lại vị trí hàng cơ sở. Giữ cổ tay thẳng tự nhiên, không tì chặt cổ tay xuống mặt bàn.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-2.5">
            <h3 className="text-lg font-semibold text-slate-900">
              03. Quy tắc Shift chéo bàn tay
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Khi gõ chữ in hoa hoặc ký tự đặc biệt: nếu phím chính thuộc <strong>bàn tay trái</strong>, hãy dùng ngón út phải nhấn <strong>Shift Phải</strong>; ngược lại nếu phím chính thuộc <strong>bàn tay phải</strong>, dùng ngón út trái nhấn <strong>Shift Trái</strong>.
            </p>
          </div>
        </div>

        {/* Finger Allocation Reference Table */}
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Bảng phân vùng 10 ngón tay tiêu chuẩn Quốc tế & Tiếng Việt Telex
            </h3>
            <span className="text-xs text-slate-500">
              Đồng bộ màu sắc với sơ đồ bàn phím phía trên
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {ORDERED_FINGERS.map(({ id, keys }) => {
              const info = FINGER_INFO[id];
              return (
                <div key={id} className="p-4 border-b border-slate-100 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${info.accentText}`}>
                      {info.name}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Neo: {info.homeKey}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 leading-relaxed">
                    {keys}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
