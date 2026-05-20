import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-dark-900)', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '2rem', fontWeight: 800, color: 'white', textDecoration: 'none' }}>Smart DSA</Link>
        </div>
        <div className="card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
