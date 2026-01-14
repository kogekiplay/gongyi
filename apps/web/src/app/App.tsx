import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { FullCalc } from '../pages/FullCalc';
import { HistoryPage } from '../pages/History';
import { About } from '../pages/About';
import { ToastProvider } from '../components/ui';

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/single" element={<Dashboard />} />
            <Route path="/full" element={<FullCalc />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
