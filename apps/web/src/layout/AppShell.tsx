import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AppProvider } from '../app/context';

export function AppShell() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar />
        <main className="flex-1 ml-[260px] flex flex-col">
          <Topbar />
          <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
             {/* Content Area */}
             <div className="max-w-[1600px] mx-auto w-full">
                <Outlet />
             </div>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
