import React from 'react';
import { RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { SessionRecord } from '../types';

interface SessionSummaryProps {
  record: SessionRecord;
  targetWpm?: number;
  targetAccuracy?: number;
  hasNextExercise: boolean;
  onRetry: () => void;
  onNext: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  record,
  targetWpm = 30,
  targetAccuracy = 93,
  hasNextExercise,
  onRetry,
  onNext,
}) => {
  const passedGoal = record.wpm >= targetWpm && record.accuracy >= targetAccuracy;

  const missedEntries = Object.entries(record.missedChars)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            {passedGoal ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Đạt mục tiêu bài luyện
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                Hoàn thành phiên gõ — Hãy thử giữ nhịp đều hơn
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kết quả: {record.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Gõ lại bài này</span>
          </button>

          {hasNextExercise && (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Bài tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-slate-500">Tốc độ chuẩn (Net WPM)</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {record.wpm}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Mục tiêu: {targetWpm} WPM
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Độ chính xác</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {record.accuracy}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Mục tiêu: {targetAccuracy}%
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Tốc độ thô (Raw WPM)</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {record.rawWpm}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {record.totalChars} ký tự trong {record.durationSec}s
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Tổng số lỗi</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {record.errorCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {record.errorCount === 0 ? 'Tuyệt đối chính xác' : 'Ưu tiên gõ đúng trước khi tăng tốc'}
          </p>
        </div>
      </div>

      {/* Missed keys diagnosis */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm">
        {missedEntries.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-600 font-medium">Các phím cần rèn thêm:</span>
            {missedEntries.map(([ch, count]) => (
              <span
                key={ch}
                className="font-mono text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md"
              >
                Phím "{ch === ' ' ? 'Space' : ch}" ({count} lần sai)
              </span>
            ))}
          </div>
        ) : (
          <p className="text-emerald-700 font-medium">
            Không có phím nào bị gõ nhầm trong phiên này. Nhịp ngón tay rất ổn định!
          </p>
        )}
      </div>
    </div>
  );
};
