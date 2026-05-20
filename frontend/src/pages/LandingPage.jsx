import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, BrainCircuit, Target, Link2, Zap, Map } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-dark-900)', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <ThreeBackground />
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid var(--color-dark-border)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Smart DSA</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginLeft: '0.5rem', letterSpacing: '1px' }}>AI-POWERED</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login"><button className="btn-outline">Login</button></Link>
          <Link to="/register"><button className="btn-primary">Get Started Free</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 2rem', maxWidth: '1024px', margin: '0 auto' }}>
        
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1rem', borderRadius: '99px', marginBottom: '2rem',
          backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
          fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa',
        }}>
          <Zap size={14} /> Auto-Syncs from LeetCode, Codeforces & GFG
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Master DSA with{' '}
          <span style={{ background: 'linear-gradient(90deg, var(--color-primary), #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Intelligence
          </span>
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-dark-muted)', marginBottom: '2.5rem', maxWidth: '650px', lineHeight: 1.7 }}>
          Connect your LeetCode, Codeforces, or GFG account — we auto-fetch all your solved problems, 
          analyze your weaknesses with AI, and build a personalized roadmap from Beginner to Master.
        </p>
        <Link to="/register">
          <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, borderRadius: '0.75rem', boxShadow: '0 0 30px rgba(88,166,255,0.2)' }}>
            🚀 Start Tracking Free
          </button>
        </Link>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Platforms Supported', value: '3+' },
            { label: 'Auto-Sync', value: 'Real-Time' },
            { label: 'AI Analysis', value: 'Advanced' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%', marginTop: '5rem' }}>
          <FeatureCard 
            icon={<Link2 size={24} color="var(--color-primary)" />} 
            iconBg="rgba(88,166,255,0.1)" 
            title="Auto-Sync Platforms" 
            desc="Connect LeetCode, Codeforces & GFG — all your solved problems are fetched automatically. Zero manual entry." 
          />
          <FeatureCard 
            icon={<BrainCircuit size={24} color="#a78bfa" />} 
            iconBg="rgba(167,139,250,0.1)" 
            title="AI Weakness Detection" 
            desc="Advanced AI analyzes your problem-solving patterns, detects weak topics, and suggests targeted practice." 
          />
          <FeatureCard 
            icon={<Map size={24} color="var(--color-status-medium)" />} 
            iconBg="rgba(210,153,34,0.1)" 
            title="Beginner → Master Roadmap" 
            desc="6-phase personalized roadmap that adapts to your progress. From Arrays to Advanced DP — we guide every step." 
          />
          <FeatureCard 
            icon={<TrendingUp size={24} color="var(--color-status-easy)" />} 
            iconBg="rgba(63,185,80,0.1)" 
            title="Progress Tracking" 
            desc="Heatmaps, streak counter, topic mastery bars, and difficulty distribution — all in real-time." 
          />
          <FeatureCard 
            icon={<Target size={24} color="var(--color-status-hard)" />} 
            iconBg="rgba(248,81,73,0.1)" 
            title="Interview Readiness" 
            desc="Get an interview readiness score based on your topic coverage, difficulty balance, and problem volume." 
          />
          <FeatureCard 
            icon={<Zap size={24} color="#F0883E" />} 
            iconBg="rgba(240,136,62,0.1)" 
            title="Daily Challenges" 
            desc="Smart daily goals that adapt to your level. Build consistency and level up your DSA skills every day." 
          />
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-dark-border)', padding: '2rem', textAlign: 'center', color: 'var(--color-dark-muted)', fontSize: '0.875rem' }}>
        © 2024 Smart DSA Tracker. Engineered for Performance. Auto-syncs from LeetCode, Codeforces & GFG.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, iconBg, title, desc }) => (
  <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'border-color 0.2s, transform 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(88,166,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-dark-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{title}</h3>
    <p style={{ color: 'var(--color-dark-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
  </div>
);

export default LandingPage;
