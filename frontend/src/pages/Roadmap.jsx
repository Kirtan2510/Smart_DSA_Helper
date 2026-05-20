import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2, Lock, Play, Target, TrendingUp, Award,
  RefreshCw, ChevronRight, Zap, Star, BookOpen
} from 'lucide-react';
import api from '../services/api';

const Roadmap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/ai/roadmap');
      setData(res.data);
      // Auto-expand active phase
      const activePhase = res.data.roadmap?.find(p => p.status === 'active');
      if (activePhase) setExpandedPhase(activePhase.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cardStyle = {
    backgroundColor: 'var(--color-dark-800)',
    border: '1px solid var(--color-dark-border)',
    borderRadius: '1rem',
    padding: '2rem',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-dark-border)', borderTopColor: '#a78bfa', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--color-dark-muted)' }}>Building your personalized roadmap...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const roadmap = data?.roadmap || [];
  const skillLevel = data?.skillLevel || { level: 'Beginner', icon: '🌱', color: '#8B949E', score: 0 };
  const interviewReadiness = data?.interviewReadiness || 0;
  const overallProgress = data?.overallProgress || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <style>{`
        @keyframes progressFill { from { width: 0; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(167,139,250,0.3); } 50% { box-shadow: 0 0 20px rgba(167,139,250,0.4); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            🗺️ Your DSA Mastery Roadmap
          </h1>
          <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.95rem' }}>
            Personalized learning path from Beginner to Master — powered by your actual performance.
          </p>
        </div>
        <button onClick={fetchData}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            border: '1px solid var(--color-dark-border)', borderRadius: '0.5rem',
            backgroundColor: 'var(--color-dark-800)', color: 'var(--color-dark-muted)',
            cursor: 'pointer', fontSize: '0.85rem',
          }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>

        {/* Skill Level */}
        <div style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, rgba(167,139,250,0.08), var(--color-dark-800))',
          borderColor: 'rgba(167,139,250,0.2)',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1.5px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            SKILL LEVEL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{skillLevel.icon}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: skillLevel.color }}>{skillLevel.level}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)' }}>Score: {skillLevel.score} XP</div>
        </div>

        {/* Overall Progress */}
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1.5px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            OVERALL PROGRESS
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{overallProgress}%</div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: `${overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, var(--color-primary))', borderRadius: '2px', animation: 'progressFill 1.5s ease' }}></div>
          </div>
        </div>

        {/* Phases Complete */}
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1.5px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            PHASES COMPLETE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-status-easy)', lineHeight: 1 }}>{data?.completedPhases || 0}</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-dark-muted)' }}>/ {data?.totalPhases || 6}</span>
          </div>
        </div>

        {/* Interview Readiness */}
        <div style={{
          ...cardStyle,
          background: interviewReadiness >= 70
            ? 'linear-gradient(135deg, rgba(63,185,80,0.08), var(--color-dark-800))'
            : interviewReadiness >= 40
            ? 'linear-gradient(135deg, rgba(210,153,34,0.08), var(--color-dark-800))'
            : cardStyle.backgroundColor,
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1.5px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            INTERVIEW READY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '2.5rem', fontWeight: 800, lineHeight: 1,
              color: interviewReadiness >= 70 ? 'var(--color-status-easy)' : interviewReadiness >= 40 ? 'var(--color-status-medium)' : 'var(--color-status-hard)',
            }}>{interviewReadiness}%</span>
            <Target size={20} color={interviewReadiness >= 70 ? 'var(--color-status-easy)' : 'var(--color-dark-muted)'} />
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: '0.5rem', display: 'flex' }}>
            <BookOpen size={22} color="#a78bfa" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>Learning Phases</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-dark-muted)' }}>Complete each phase to unlock the next. Milestones adapt to your progress.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roadmap.map((phase, i) => {
            const isDone = phase.status === 'done';
            const isActive = phase.status === 'active';
            const isLocked = phase.status === 'locked';
            const isExpanded = expandedPhase === phase.id;

            const statusColors = {
              done: { bg: 'rgba(63,185,80,0.08)', border: 'rgba(63,185,80,0.2)', accent: 'var(--color-status-easy)' },
              active: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)', accent: '#a78bfa' },
              locked: { bg: 'transparent', border: 'var(--color-dark-border)', accent: 'var(--color-dark-muted)' },
            };
            const colors = statusColors[phase.status];

            return (
              <div key={phase.id}
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isLocked ? 0.55 : 1,
                  animation: isActive ? 'glow 3s infinite' : 'none',
                }}>

                {/* Phase Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: isDone ? 'rgba(63,185,80,0.15)' : isActive ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${colors.accent}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isDone && <CheckCircle2 size={16} color="var(--color-status-easy)" />}
                      {isActive && <Play size={14} color="#a78bfa" fill="#a78bfa" />}
                      {isLocked && <Lock size={14} color="var(--color-dark-muted)" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                          color: colors.accent,
                          padding: '0.1rem 0.4rem', borderRadius: '3px',
                          backgroundColor: `${colors.accent}15`,
                        }}>PHASE {phase.id}</span>
                        {isActive && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.15)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>CURRENT</span>}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: isLocked ? 'var(--color-dark-muted)' : 'white' }}>{phase.title}</h4>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Progress ring */}
                    {!isLocked && (
                      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        <svg width="48" height="48" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke={colors.accent} strokeWidth="4"
                            strokeDasharray={`${(phase.progress / 100) * 125.6} 125.6`}
                            strokeLinecap="round" transform="rotate(-90 24 24)"
                            style={{ transition: 'stroke-dasharray 1s ease' }} />
                        </svg>
                        <span style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, color: 'white',
                        }}>{phase.progress}%</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)' }}>{phase.eta}</span>
                    <ChevronRight size={18} color="var(--color-dark-muted)"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${colors.border}` }}>
                    <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      {phase.description}
                    </p>

                    {/* Topics */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {phase.topics.map(topic => (
                        <span key={topic} style={{
                          backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-dark-border)',
                          padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--color-dark-text)', fontWeight: 500,
                        }}>{topic}</span>
                      ))}
                    </div>

                    {/* Milestones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {phase.milestones?.map((m, j) => (
                        <div key={j}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <span style={{ color: m.done ? 'var(--color-status-easy)' : 'var(--color-dark-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              {m.done ? <CheckCircle2 size={12} /> : <Target size={12} />} {m.label}
                            </span>
                            <span style={{ color: 'var(--color-dark-muted)', fontWeight: 600 }}>{m.current}/{m.target}</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (m.current / m.target) * 100)}%`, height: '100%',
                              backgroundColor: m.done ? 'var(--color-status-easy)' : colors.accent,
                              borderRadius: '2px', transition: 'width 0.8s ease',
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(88,166,255,0.1))',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: '1rem', padding: '2rem', textAlign: 'center',
      }}>
        <Award size={40} color="#a78bfa" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem' }}>
          {data?.totalProblems === 0 ? 'Your Journey Begins Here' :
           data?.totalProblems < 50 ? 'Great Start! Keep Building Momentum' :
           data?.totalProblems < 150 ? "You're Making Incredible Progress!" :
           '🏆 You Are Becoming a DSA Master!'}
        </h3>
        <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          {data?.totalProblems === 0
            ? 'Connect your coding platform accounts and start solving problems to unlock your personalized roadmap.'
            : `${data?.totalProblems} problems solved across all platforms. ${
                interviewReadiness >= 70 ? "You're interview ready!" : `${100 - interviewReadiness}% more to go for full interview readiness.`
              }`}
        </p>
      </div>
    </div>
  );
};

export default Roadmap;
