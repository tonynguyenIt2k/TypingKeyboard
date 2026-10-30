import React from 'react';
import { Trash2 } from 'lucide-react';
import { SessionRecord } from '../types';

interface StatsSectionProps {
  history: SessionRecord[];
  onClearHistory: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  history,
  onClearHistory,
}) => {
  const totalSessions = history.length;
  const bestWpm = totalSessions > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;
  const avgWpm =
    totalSessions > 0
      ? Math.round(history.reduce((acc, h) => acc + h.wpm, 0) / totalSessions)
      : 0;
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalSessions)
      : 0;
  const totalMinutes = Math.max(
    0,
    Math.round(history.reduce((acc, h) => acc + h.durationSec, 0) / 60)
  );

  // Aggregate problem keys across all sessions
  const aggregatedErrors: Record<string, number> = {};
  for (const session of history) {
    for (const [char, count] of Object.entries(session.missedChars || {})) {
      aggregatedErrors[char] = (aggregatedErrors[char] || 0) + count;
    }
  }
  const topWeakKeys = Object.entries(aggregatedErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Last 12 sessions chronological for SVG chart
  const recentChronological = [...history].slice(0, 12).reverse();

  return (
    <section id="thong-ke" className="py-14 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Thống kê tiến độ & Phân tích phím yếu cá nhân
            </h2>
            <p className="text-base text-slate-600">
              Dữ liệu luyện tập được lưu trực tiếp trên trình duyệt của bạn để theo dõi sự cải thiện tốc độ WPM và độ chính xác theo thời gian.
            </p>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          )}
        </div>

        {/* 4 Summary Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Kỷ lục tốc độ cao nhất</p>
            <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {bestWpm} <span className="text-sm font-normal text-slate-500">WPM</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Tốc độ trung bình</p>
            <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {avgWpm} <span className="text-sm font-normal text-slate-500">WPM</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Độ chính xác trung bình</p>
            <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {avgAccuracy}%
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Số phiên hoàn thành</p>
            <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {totalSessions}{' '}
              <span className="text-sm font-normal text-slate-500">
                ({totalMinutes} phút)
              </span>
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center space-y-2 rounded-xl bg-slate-50 border border-slate-200 px-6">
            <p className="text-base font-semibold text-slate-800">
              Chưa có phiên luyện gõ nào được ghi nhận
            </p>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Hãy hoàn thành một bài tập ở khu vực bàn phím phía trên để hệ thống vẽ biểu đồ tốc độ WPM và chỉ ra những phím bạn hay gõ nhầm nhất.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: WPM Trend Chart + Weak Keys */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    Biểu đồ tốc độ 12 phiên gần nhất
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Đơn vị: WPM</span>
                </div>

                <WpmTrendChart records={recentChronological} />
              </div>

              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Phím thường gõ sai nhất
                </h3>
                {topWeakKeys.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Bạn chưa mắc lỗi phím nào đáng kể trong các phiên vừa qua.
                  </p>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {topWeakKeys.map(([ch, count]) => {
                      const maxErr = topWeakKeys[0][1] || 1;
                      const ratio = Math.max(0.08, count / maxErr);
                      return (
                        <div key={ch} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                            <span className="font-semibold text-slate-800">
                              Phím "{ch === ' ' ? 'Space (Cách)' : ch}"
                            </span>
                            <span className="text-slate-500">{count} lần nhầm</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 origin-left"
                              style={{ transform: `scaleX(${ratio})` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Sessions Table */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  Nhật ký phiên luyện gần đây
                </h3>
                <span className="text-xs text-slate-500">
                  Hiển thị tối đa 10 phiên mới nhất
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Bài luyện</th>
                      <th className="py-3 px-4 text-right">Tốc độ</th>
                      <th className="py-3 px-4 text-right">Chính xác</th>
                      <th className="py-3 px-4 text-right">Thời lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.slice(0, 10).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-[240px] truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {item.wpm} WPM
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                          {item.accuracy}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                          {item.durationSec}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const WpmTrendChart: React.FC<{ records: SessionRecord[] }> = ({ records }) => {
  if (records.length === 1) {
    return (
      <div className="h-36 flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-lg">
        Đã ghi nhận phiên đầu tiên ({records[0].wpm} WPM). Hoàn thành thêm 1 phiên nữa để vẽ đường xu hướng.
      </div>
    );
  }

  const width = 420;
  const height = 150;
  const padX = 28;
  const padY = 20;

  const maxWpm = Math.max(50, ...records.map((r) => r.wpm));
  const minWpm = 0;

  const points = records.map((rec, idx) => {
    const x =
      padX + (idx / Math.max(1, records.length - 1)) * (width - padX * 2);
    const y =
      height -
      padY -
      ((rec.wpm - minWpm) / Math.max(1, maxWpm - minWpm)) * (height - padY * 2);
    return { x, y, wpm: rec.wpm };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-40 overflow-visible"
      role="img"
      aria-label="Biểu đồ xu hướng tốc độ gõ WPM"
    >
      {/* Grid lines */}
      {[0, 0.5, 1].map((step) => {
        const y = height - padY - step * (height - padY * 2);
        const labelVal = Math.round(minWpm + step * (maxWpm - minWpm));
        return (
          <g key={step}>
            <line
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
            />
            <text
              x={0}
              y={y + 4}
              fontSize="10"
              fill="#64748B"
              fontFamily="JetBrains Mono, monospace"
            >
              {labelVal}
            </text>
          </g>
        );
      })}

      {/* Line path */}
      <polyline
        fill="none"
        stroke="#0284C7"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />

      {/* Data nodes */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <text
            x={pt.x}
            y={pt.y - 8}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fill="#0F172A"
            fontFamily="JetBrains Mono, monospace"
          >
            {pt.wpm}
          </text>
        </g>
      ))}
    </svg>
  );
};
