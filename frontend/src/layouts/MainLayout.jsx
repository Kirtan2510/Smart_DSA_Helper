import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-dark-900)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem', overflowY: 'auto', height: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
