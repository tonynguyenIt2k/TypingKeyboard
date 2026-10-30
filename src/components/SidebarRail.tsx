import React, { useState, useRef, useEffect } from 'react';
import {
  Keyboard,
  Home,
  PlaySquare,
  Send,
  Search,
  Heart,
  Plus,
  Menu,
  Boxes,
  Volume2,
  VolumeX,
  Eye,
  Hand,
  RotateCcw,
  X,
} from 'lucide-react';
import { Lesson, PracticeMode } from '../types';
import { LESSONS } from '../data/lessonsData';

export type ActiveNavSection = 'san-tap' | 'lo-trinh' | 'nguyen-tac' | 'thong-ke';

interface SidebarRailProps {
  activeSection: ActiveNavSection;
  mode: PracticeMode;
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  showFingerZones: boolean;
  showHandSvg: boolean;
  bestWpm: number;
  totalSessions: number;
  onNavigateSection: (section: ActiveNavSection) => void;
  onStartTimedTest: () => void;
  onOpenCustomText: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onResetSession: () => void;
  onToggleSound: () => void;
  onToggleErrorSound: () => void;
  onToggleZones: () => void;
  onToggleHands: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeSection,
  mode,
  soundEnabled,
  errorSoundEnabled,
  showFingerZones,
  showHandSvg,
  bestWpm,
  totalSessions,
  onNavigateSection,
  onStartTimedTest,
  onOpenCustomText,
  onSelectLesson,
  onResetSession,
  onToggleSound,
  onToggleErrorSound,
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
      {/* Desktop Fixed Vertical Dark Sidebar Rail (matching reference image) */}
      <aside
        aria-label="Thanh điều hướng chính"
        className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[72px] bg-[#0B0D10] text-white flex-col items-center justify-between py-6 border-r border-white/10 select-none"
      >
        {/* Top Brand Icon */}
        <button
          type="button"
          onClick={() => onNavigateSection('san-tap')}
          title="Mười Ngón — Về Sân tập"
          className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Keyboard className="w-7 h-7 stroke-[1.8]" />
          <RailTooltip label="Mười Ngón" />
        </button>

        {/* Center Main Navigation Stack */}
        <nav className="flex flex-col items-center gap-3">
          {/* 1. Home / Sân tập */}
          <RailButton
            label="Sân tập gõ phím"
            isActive={activeSection === 'san-tap' && mode === PracticeMode.Lesson}
            onClick={() => onNavigateSection('san-tap')}
          >
            <Home
              className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                activeSection === 'san-tap' && mode === PracticeMode.Lesson
                  ? 'fill-white text-white stroke-[2]'
                  : 'stroke-[1.8]'
              }`}
            />
          </RailButton>

          {/* 2. Lộ trình 14 bài học (PlaySquare icon like Reels) */}
          <RailButton
            label="Lộ trình 14 bài học"
            isActive={activeSection === 'lo-trinh'}
            onClick={() => onNavigateSection('lo-trinh')}
          >
            <PlaySquare className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 3. Kiểm tra tốc độ 60s (Paper-plane / Quick Launch icon) */}
          <RailButton
            label="Kiểm tra tốc độ 60 giây"
            isActive={mode === PracticeMode.TimedTest && activeSection === 'san-tap'}
            onClick={onStartTimedTest}
          >
            <Send className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 4. Tìm kiếm nhanh bài học (Search) */}
          <RailButton
            label="Tìm nhanh bài học"
            isActive={openSearchModal}
            onClick={() => setOpenSearchModal(true)}
          >
            <Search className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 5. Thống kê WPM & Kỷ lục (Heart with notification dot when sessions recorded) */}
          <RailButton
            label={
              totalSessions > 0
                ? `Thống kê & Kỷ lục (${bestWpm} WPM)`
                : 'Thống kê tiến độ'
            }
            isActive={activeSection === 'thong-ke'}
            onClick={() => onNavigateSection('thong-ke')}
          >
            <div className="relative">
              <Heart className="w-6 h-6 stroke-[1.8] transition-transform group-hover:scale-105" />
              {totalSessions > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0B0D10]"
                />
              )}
            </div>
          </RailButton>

          {/* 6. Tạo văn bản tự chọn (+) */}
          <RailButton
            label="Soạn văn bản tự chọn"
            isActive={mode === PracticeMode.CustomText && activeSection === 'san-tap'}
            onClick={onOpenCustomText}
          >
            <Plus className="w-6 h-6 stroke-[1.9] transition-transform group-hover:scale-105" />
          </RailButton>

          {/* 7. Hồ sơ kỷ lục cá nhân (Circular Avatar Badge) */}
          <RailButton
            label={`Hồ sơ người tập · Kỷ lục ${bestWpm} WPM`}
            isActive={false}
            onClick={() => onNavigateSection('thong-ke')}
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/25 flex items-center justify-center text-[10px] font-mono font-bold text-sky-300 overflow-hidden">
              {bestWpm > 0 ? bestWpm : '10N'}
            </div>
          </RailButton>
        </nav>

        {/* Bottom Utility Stack (Menu + Finger Architecture) */}
        <div ref={menuRef} className="relative flex flex-col items-center gap-3">
          {/* Hamburger Quick Settings Popover */}
          <RailButton
            label="Tùy chỉnh sân tập"
            isActive={openSettingsMenu}
            onClick={() => setOpenSettingsMenu((v) => !v)}
          >
            <Menu className="w-6 h-6 stroke-[1.8]" />
          </RailButton>

          {/* 3-Blocks / Finger Zones Principle */}
          <RailButton
            label="Quy tắc & Sơ đồ 10 ngón"
            isActive={activeSection === 'nguyen-tac'}
            onClick={() => onNavigateSection('nguyen-tac')}
          >
            <Boxes className="w-6 h-6 stroke-[1.8]" />
          </RailButton>

          {/* Popover Menu anchored next to Hamburger */}
          {openSettingsMenu && (
            <div className="absolute bottom-12 left-16 w-64 rounded-xl bg-[#15181E] text-white border border-white/15 shadow-xl p-2 space-y-1 z-50">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white">Cài đặt nhanh sân tập</p>
                <p className="text-[11px] text-slate-400">Bật/tắt âm thanh & hướng dẫn</p>
              </div>

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
          aria-label="Sân tập"
          className={`p-2.5 rounded-xl ${
            activeSection === 'san-tap' && mode === PracticeMode.Lesson ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('lo-trinh')}
          aria-label="Lộ trình 14 bài"
          className={`p-2.5 rounded-xl ${activeSection === 'lo-trinh' ? 'bg-white/15 text-white' : 'text-slate-300'}`}
        >
          <PlaySquare className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onStartTimedTest}
          aria-label="Kiểm tra tốc độ 60 giây"
          className={`p-2.5 rounded-xl ${
            mode === PracticeMode.TimedTest ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setOpenSearchModal(true)}
          aria-label="Tìm bài học"
          className="p-2.5 rounded-xl text-slate-300"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenCustomText}
          aria-label="Văn bản tự chọn"
          className={`p-2.5 rounded-xl ${
            mode === PracticeMode.CustomText ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateSection('thong-ke')}
          aria-label="Thống kê WPM"
          className={`relative p-2.5 rounded-xl ${
            activeSection === 'thong-ke' ? 'bg-white/15 text-white' : 'text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5" />
          {totalSessions > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
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
          ? 'bg-white/14 text-white'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
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
