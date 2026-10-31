import React, { useState, useRef, useEffect } from 'react';
import {
  Keyboard,
  BookOpen,
  Timer,
  FilePlus2,
  Hand,
  BarChart3,
  Search,
  SlidersHorizontal,
  Trophy,
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  FastForward,
  Sparkles,
  Activity,
  X,
} from 'lucide-react';
import { Lesson, PracticeMode } from '../types';
import { LESSONS } from '../data/lessonsData';
import { BrandLogo } from './BrandLogo';

export type ActiveNavSection = 'san-tap' | 'lo-trinh' | 'nguyen-tac' | 'thong-ke';

interface SidebarRailProps {
  activeSection: ActiveNavSection;
  mode: PracticeMode;
  ghostMode: boolean;
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  metronomeEnabled: boolean;
  metronomeWpm: number;
  showFingerZones: boolean;
  showHandSvg: boolean;
  bestWpm: number;
  totalSessions: number;
  onNavigateSection: (section: ActiveNavSection) => void;
  onStartTimedTest: () => void;
  onStartZenMode: () => void;
  onOpenCustomText: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onResetSession: () => void;
  onToggleGhostMode: () => void;
  onToggleSound: () => void;
  onToggleErrorSound: () => void;
  onToggleMetronome: () => void;
  onChangeMetronomeWpm: (wpm: number) => void;
  onToggleZones: () => void;
  onToggleHands: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeSection,
  mode,
  ghostMode,
  soundEnabled,
  errorSoundEnabled,
  metronomeEnabled,
  metronomeWpm,
  showFingerZones,
  showHandSvg,
  bestWpm,
  totalSessions,
  onNavigateSection,
  onStartTimedTest,
  onStartZenMode,
  onOpenCustomText,
  onSelectLesson,
  onResetSession,
  onToggleGhostMode,
  onToggleSound,
  onToggleErrorSound,
  onToggleMetronome,
  onChangeMetronomeWpm,
  onToggleZones,
  onToggleHands,
}) => {
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSettingsMenu, setOpenSettingsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (openSearchModal) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [openSearchModal]);

  const filteredLessons = LESSONS.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.number.includes(searchQuery) ||
      l.focusKeys.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Desktop Fixed Vertical Dark Sidebar Rail with Domain-Intuitive Icons */}
      <aside
        aria-label="Thanh điều hướng chính"
        className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[72px] bg-[#0B0D10] text-white flex-col items-center justify-between py-6 border-r border-white/10 select-none"
      >
        {/* Top Brand Mark: Custom Mười Ngón Logo */}
        <button
          type="button"
          onClick={() => onNavigateSection('san-tap')}
          title="Mười Ngón — Về Sân tập"
          className="group relative rounded-xl flex items-center justify-center focus:outline-none cursor-pointer"
        >
          <BrandLogo size="md" />
          <RailTooltip label="Mười Ngón — Trang chính" />
        </button>

        {/* Center Main Navigation Stack — Semantically matched to Touch Typing */}
        <nav className="flex flex-col items-center gap-2.5">
          {/* 1. Sân tập gõ phím -> Keyboard */}
          <RailButton
            label="Sân tập gõ phím"
            isActive={activeSection === 'san-tap' && mode === PracticeMode.Lesson}
            onClick={() => onNavigateSection('san-tap')}
          >
            <Keyboard className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 2. Lộ trình 14 bài học -> BookOpen */}
          <RailButton
            label="Lộ trình 14 bài học"
            isActive={activeSection === 'lo-trinh'}
            onClick={() => onNavigateSection('lo-trinh')}
          >
            <BookOpen className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 3. Kiểm tra tốc độ đếm ngược -> Timer */}
          <RailButton
            label="Kiểm tra tốc độ (30s / 60s / 120s)"
            isActive={mode === PracticeMode.TimedTest && activeSection === 'san-tap'}
            onClick={onStartTimedTest}
          >
            <Timer className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 4. Chế độ Zen Lyric (Giao diện tối Karaoke) -> Sparkles */}
          <RailButton
            label="Chế độ Zen Lyric (Gõ chill nền tối)"
            isActive={mode === PracticeMode.ZenFocus && activeSection === 'san-tap'}
            onClick={onStartZenMode}
          >
            <Sparkles className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 5. Văn bản tự chọn -> FilePlus2 */}
          <RailButton
            label="Văn bản tự chọn cá nhân"
            isActive={mode === PracticeMode.CustomText && activeSection === 'san-tap'}
            onClick={onOpenCustomText}
          >
            <FilePlus2 className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 5. Quy tắc & Sơ đồ đặt 10 ngón tay -> Hand */}
          <RailButton
            label="Quy tắc & Sơ đồ 10 ngón tay"
            isActive={activeSection === 'nguyen-tac'}
            onClick={() => onNavigateSection('nguyen-tac')}
          >
            <Hand className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 6. Thống kê tiến độ & Phím yếu -> BarChart3 */}
          <RailButton
            label={
              totalSessions > 0
                ? `Thống kê tiến độ (${totalSessions} phiên)`
                : 'Thống kê tiến độ WPM'
            }
            isActive={activeSection === 'thong-ke'}
            onClick={() => onNavigateSection('thong-ke')}
          >
            <div className="relative">
              <BarChart3 className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
              {totalSessions > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#0B0D10]"
                />
              )}
            </div>
          </RailButton>

          {/* 7. Tìm kiếm nhanh bài học / phím -> Search */}
          <RailButton
            label="Tìm nhanh bài học theo phím"
            isActive={openSearchModal}
            onClick={() => setOpenSearchModal(true)}
          >
            <Search className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>
        </nav>

        {/* Bottom Utility Stack: Best WPM Record + Audio/Visual Settings */}
        <div ref={menuRef} className="relative flex flex-col items-center gap-2.5">
          {/* Personal Best WPM Trophy Badge */}
          <RailButton
            label={
              bestWpm > 0
                ? `Kỷ lục cá nhân: ${bestWpm} WPM`
                : 'Chưa có kỷ lục — Hãy hoàn thành 1 bài gõ'
            }
            isActive={false}
            onClick={() => onNavigateSection('thong-ke')}
          >
            <div className="flex flex-col items-center justify-center leading-none gap-0.5">
              <Trophy
                className={`w-4 h-4 ${
                  bestWpm > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] font-mono font-bold tabular-nums text-slate-200">
                {bestWpm > 0 ? bestWpm : '--'}
              </span>
            </div>
          </RailButton>

          {/* Settings Popover Trigger -> SlidersHorizontal */}
          <RailButton
            label="Cài đặt âm thanh & hiển thị"
            isActive={openSettingsMenu}
            onClick={() => setOpenSettingsMenu((v) => !v)}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </RailButton>

              {/* Popover Menu anchored next to Settings button */}
          {openSettingsMenu && (
            <div className="absolute bottom-2 left-16 w-72 rounded-xl bg-[#15181E] text-white border border-white/15 shadow-xl p-2.5 space-y-1 z-50">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white">Tùy chỉnh sân tập</p>
                <p className="text-[11px] text-slate-400">Nhịp Metronome, âm thanh & hướng dẫn</p>
              </div>

              {/* Metronome Toggle + Target WPM Slider */}
              <div className="rounded-lg bg-white/[0.04] border border-white/10 p-2.5 space-y-2.5 my-1">
                <button
                  type="button"
                  onClick={onToggleMetronome}
                  className="w-full flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium text-white">
                    <Activity
                      className={`w-4 h-4 ${
                        metronomeEnabled ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span>Nhịp Metronome</span>
                  </span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                      metronomeEnabled
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {metronomeEnabled ? 'Đang bật' : 'Tắt'}
                  </span>
                </button>

                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                    <label htmlFor="metronome-wpm-slider" className="text-slate-300">
                      Tốc độ nhịp: <strong className="text-white">{metronomeWpm} WPM</strong>
                    </label>
                    <span className="text-slate-400">{metronomeWpm * 5} nhịp/phút</span>
                  </div>

                  <input
                    id="metronome-wpm-slider"
                    type="range"
                    min={15}
                    max={90}
                    step={5}
                    value={metronomeWpm}
                    onChange={(e) => onChangeMetronomeWpm(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/15 rounded-lg"
                  />

                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {[25, 40, 60, 80].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onChangeMetronomeWpm(preset)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          metronomeWpm === preset
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {preset} WPM
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleGhostMode}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FastForward className={`w-4 h-4 ${ghostMode ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>Ghost Typing (Gõ đè)</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300">{ghostMode ? 'Bật' : 'Tắt'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleSound}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Âm phím cơ</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300">{soundEnabled ? 'Bật' : 'Tắt'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleErrorSound}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {errorSoundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Âm báo lỗi (Buzzer)</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300">{errorSoundEnabled ? 'Bật' : 'Tắt'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleZones}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Eye className={`w-4 h-4 ${showFingerZones ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Màu phân vùng ngón</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300">{showFingerZones ? 'Hiện' : 'Ẩn'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleHands}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Hand className={`w-4 h-4 ${showHandSvg ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>Sơ đồ 2 bàn tay</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300">{showHandSvg ? 'Hiện' : 'Ẩn'}</span>
              </button>

              <div className="pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onResetSession();
                    setOpenSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đặt lại bài đang gõ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Compact Bottom Dark Icon Bar (≤15% viewport height) */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#0B0D10] text-white border-t border-white/10 flex items-center justify-around px-2"
      >
        <button
          type="button"
          onClick={() => onNavigateSection('san-tap')}
          aria-label="Sân tập gõ phím"
          className={`p-2.5 rounded-xl ${
            activeSection === 'san-tap' && mode === PracticeMode.Lesson ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Keyboard className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('lo-trinh')}
          aria-label="Lộ trình 14 bài học"
          className={`p-2.5 rounded-xl ${activeSection === 'lo-trinh' ? 'bg-white/15 text-white' : 'text-slate-300'}`}
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onStartTimedTest}
          aria-label="Kiểm tra tốc độ"
          className={`p-2.5 rounded-xl ${
            mode === PracticeMode.TimedTest ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Timer className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenCustomText}
          aria-label="Văn bản tự chọn"
          className={`p-2.5 rounded-xl ${
            mode === PracticeMode.CustomText ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <FilePlus2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('nguyen-tac')}
          aria-label="Quy tắc 10 ngón"
          className={`p-2.5 rounded-xl ${
            activeSection === 'nguyen-tac' ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('thong-ke')}
          aria-label="Thống kê WPM"
          className={`relative p-2.5 rounded-xl ${
            activeSection === 'thong-ke' ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          {totalSessions > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400" />
          )}
        </button>
      </nav>

      {/* Quick Lesson Search Modal (Triggered by Search Icon on the Rail) */}
      {openSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-start justify-center pt-20 px-4"
          onClick={() => setOpenSearchModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học theo tên, hàng phím hoặc ký tự (VD: F, J, Shift, Telex)..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpenSearchModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Đóng tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredLessons.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy bài học phù hợp với "{searchQuery}"
                </div>
              ) : (
                filteredLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      onSelectLesson(lesson);
                      setOpenSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        Bài {lesson.number}. {lesson.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {lesson.category} · Phím trọng tâm: {lesson.focusKeys.join(' ')}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-sky-700 font-semibold shrink-0">
                      {lesson.targetWpm} WPM
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface RailButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const RailButton: React.FC<RailButtonProps> = ({ label, isActive, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
        isActive
          ? 'bg-sky-600 text-white shadow-sm'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
      <RailTooltip label={label} />
    </button>
  );
};

const RailTooltip: React.FC<{ label: string }> = ({ label }) => (
  <span
    role="tooltip"
    className="pointer-events-none absolute left-[64px] px-2.5 py-1.5 rounded-lg bg-[#181B22] text-white text-xs font-medium whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 shadow-lg border border-white/10 z-50"
  >
    {label}
  </span>
);
