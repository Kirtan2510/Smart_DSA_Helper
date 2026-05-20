import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, Database, LogOut, Medal, Flame, Link2, Map, Brain, GraduationCap, Boxes } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [streak, setStreak] = useState(user?.streak || 0);
  const [skillLevel, setSkillLevel] = useState(null);

  // Fetch latest streak and skill level in real time
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summaryRes, aiRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/ai/weak-topics').catch(() => ({ data: {} })),
        ]);
        setStreak(summaryRes.data.streak || 0);
        if (aiRes.data?.skillLevel) setSkillLevel(aiRes.data.skillLevel);
      } catch { /* silent */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Platforms', path: '/platforms', icon: <Link2 size={20} /> },
    { name: 'Questions', path: '/questions', icon: <Code2 size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <Brain size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={20} /> },
    { name: 'Learn', path: '/learn', icon: <GraduationCap size={20} /> },
    { name: 'Visualizer', path: '/visualize', icon: <Boxes size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside style={{
      width: '260px', backgroundColor: 'var(--color-dark-800)', height: '100vh',
      position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column',
      padding: '1.5rem', borderRight: '1px solid var(--color-dark-border)', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Smart DSA</h2>
        <p style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', fontWeight: 600, letterSpacing: '1px', marginTop: '0.15rem' }}>AI-POWERED TRACKER</p>
      </div>

      {/* User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-dark-700)', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--color-dark-border)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,166,255,0.3), rgba(167,139,250,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {skillLevel ? <span style={{ fontSize: '1.1rem' }}>{skillLevel.icon}</span> : <Medal size={20} color="var(--color-primary)" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-dark-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Flame size={12} color="#FF9F0A" /> {streak} Day Streak
            {skillLevel && (
              <span style={{ marginLeft: '0.25rem', color: skillLevel.color, fontWeight: 600 }}>
                • {skillLevel.level}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink to={item.path} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                borderRadius: '0.5rem', fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-dark-muted)',
                backgroundColor: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s',
              })}>
                {item.icon}<span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NavLink to="/platforms" style={{ display: 'block', width: '100%', padding: '0.75rem', backgroundColor: 'rgba(88,166,255,0.15)', color: 'var(--color-primary)', border: '1px solid rgba(88,166,255,0.3)', borderRadius: '0.5rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}>
          🔗 Connect & Sync
        </NavLink>
        <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '1rem' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--color-dark-muted)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '0.875rem' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-dark-700)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-dark-muted)'; }}>
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
