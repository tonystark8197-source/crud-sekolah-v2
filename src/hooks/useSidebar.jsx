import React, { useState, useEffect, createContext, useContext } from 'react';

// Create Sidebar Context
const SidebarContext = createContext();

// Sidebar Provider
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 64 : 256); // 0px, 4rem (64px), 16rem (256px)

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      setIsCollapsed,
      isMobileOpen,
      setIsMobileOpen,
      isMobile,
      sidebarWidth
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook to use Sidebar Context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default useSidebar;
