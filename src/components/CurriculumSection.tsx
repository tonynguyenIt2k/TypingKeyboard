import React, { useState } from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { LESSONS } from '../data/lessonsData';
import { Lesson, LessonCategory, SessionRecord } from '../types';

interface CurriculumSectionProps {
  activeLessonId: string;
  history: SessionRecord[];
  onSelectLesson: (lesson: Lesson) => void;
}

const CATEGORIES: LessonCategory[] = [
  LessonCategory.HomeRow,
  LessonCategory.TopRow,
  LessonCategory.BottomRow,
  LessonCategory.NumbersShift,
  LessonCategory.VietnameseProse,
  LessonCategory.EnglishCode,
];

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  activeLessonId,
  history,
  onSelectLesson,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const bestByLesson = React.useMemo(() => {
    const map: Record<string, { wpm: number; accuracy: number }> = {};
    for (const rec of history) {
      if (!rec.lessonId) continue;
      const prev = map[rec.lessonId];
      if (!prev || rec.wpm > prev.wpm) {
        map[rec.lessonId] = { wpm: rec.wpm, accuracy: rec.accuracy };
      }
    }
    return map;
  }, [history]);

  const filteredLessons =
    selectedCategory === 'ALL'
      ? LESSONS
      : LESSONS.filter((l) => l.category === selectedCategory);

  return (
    <section id="lo-trinh" className="py-14 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Lộ trình 14 bài học từ Hàng phím cơ sở đến Văn bản thực tế
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Mỗi bài học tập trung xây dựng trí nhớ cơ bắp cho từng cặp ngón tay đối xứng trước khi ghép từ và câu tiếng Việt có dấu.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({LESSONS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid (Single elevation level, clean unboxed metadata) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const isSelected = lesson.id === activeLessonId;
            const best = bestByLesson[lesson.id];
            const isCompleted =
              best && best.wpm >= lesson.targetWpm && best.accuracy >= lesson.targetAccuracy;

            return (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectLesson(lesson);
                  }
                }}
                className={`group rounded-xl p-5 border transition-colors flex flex-col justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-600 ${
                  isSelected
                    ? 'bg-white border-sky-600 ring-1 ring-sky-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  {/* Quiet 1-line text kicker with typographic separators (no pills) */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono font-semibold text-slate-700">
                        Bài {lesson.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{lesson.category}</span>
                    </div>

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã đạt
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {lesson.number}. {lesson.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 font-mono tabular-nums">
                    <span>Phím: {lesson.focusKeys.slice(0, 5).join(' ')}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span>Đích: {lesson.targetWpm} WPM</span>
                  </div>

                  {best ? (
                    <span className="font-mono font-semibold tabular-nums text-slate-800 shrink-0">
                      Kỷ lục: {best.wpm} WPM ({best.accuracy}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-sky-700 shrink-0">
                      <Play className="w-3 h-3" />
                      Luyện ngay
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
