import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import ToastContainer from '../ui/Toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      if (w < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: '#0a0a0f',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 998,
              }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            style={{
              position: isMobile ? 'fixed' : 'relative',
              zIndex: 999,
              height: '100vh',
            }}
          >
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <TopBar />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: isMobile ? 16 : isTablet ? 20 : 24,
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile menu button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 48,
            height: 48,
            borderRadius: 24,
            background: '#6366f1',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ☰
        </button>
      )}
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
