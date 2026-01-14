import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, History, Settings, FileSpreadsheet } from 'lucide-react';
import { cn } from '../components/ui';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: '概览', to: '/' },
  { icon: Calculator, label: '单参数计算', to: '/single' },
  { icon: FileSpreadsheet, label: '全参数计算', to: '/full' },
  { icon: History, label: '历史记录', to: '/history' },
];

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-50 transition-colors">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="font-semibold text-lg text-[var(--primary)]">杨铜工艺</span>
        </div>
        
        <div className="text-xs font-semibold text-[var(--muted)] px-3 mb-2 uppercase tracking-wider">
          Dashboard
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-white text-[var(--primary)] shadow-sm border border-[var(--border)]" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <NavLink 
            to="/about"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
        >
            <Settings size={18} />
            设置与关于
        </NavLink>
      </div>
    </aside>
  );
}
