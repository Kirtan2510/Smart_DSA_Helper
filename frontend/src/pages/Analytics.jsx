import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle, RefreshCw, TrendingUp, Target, Zap, Brain,
  ChevronRight, Award, BookOpen, ArrowUpRight, BarChart3, Lightbulb
} from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, weakRes, recsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/ai/weak-topics'),
        api.get('/ai/recommendations'),
      ]);
      setSummary(summaryRes.data);
      setWeakTopics(weakRes.data);
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const cardStyle = {
    backgroundColor: 'var(--color-dark-800)',
    border: '1px solid var(--color-dark-border)',
    borderRadius: '1rem',
    padding: '2rem',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-dark-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--color-dark-muted)' }}>Analyzing your performance...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const topicStats = summary?.topicStats || [];
  const total = summary?.total || 0;
  const skillLevel = weakTopics?.skillLevel || { level: 'Beginner', icon: '🌱', color: '#8B949E', score: 0 };
  const weakList = weakTopics?.weakTopics || [];
  const recs = recommendations?.recommendations || [];
  const dailyGoal = recommendations?.dailyGoal || { target: 3, completed: 0, message: 'Start solving!' };

  const priorityColors = {
    critical: { bg: 'rgba(248,81,73,0.08)', border: 'rgba(248,81,73,0.2)', text: 'var(--color-status-hard)' },
    high: { bg: 'rgba(210,153,34,0.08)', border: 'rgba(210,153,34,0.2)', text: 'var(--color-status-medium)' },
    medium: { bg: 'rgba(88,166,255,0.08)', border: 'rgba(88,166,255,0.2)', text: 'var(--color-primary)' },
    low: { bg: 'rgba(63,185,80,0.08)', border: 'rgba(63,185,80,0.2)', text: 'var(--color-status-easy)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        @keyframes progressFill { from { width: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Performance Insights</h1>
          <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.95rem' }}>
            AI-powered analysis of your coding journey
          </p>
        </div>
        <button onClick={fetchData} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
          border: '1px solid var(--color-dark-border)', borderRadius: '0.5rem',
          backgroundColor: 'var(--color-dark-800)', color: 'var(--color-dark-muted)',
          cursor: 'pointer', fontSize: '0.85rem',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>TOTAL SOLVED</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{total}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>EASY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-status-easy)' }}>{summary?.easy || 0}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>MEDIUM</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-status-medium)' }}>{summary?.medium || 0}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>HARD</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-status-hard)' }}>{summary?.hard || 0}</div>
        </div>
        <div style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, rgba(167,139,250,0.08), var(--color-dark-800))',
          borderColor: 'rgba(167,139,250,0.2)',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>SKILL LEVEL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{skillLevel.icon}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: skillLevel.color }}>{skillLevel.level}</span>
          </div>
        </div>
      </div>

      {/* Daily Goal + Weak Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

        {/* Daily Goal */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="var(--color-status-medium)" /> Daily Goal
          </h3>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={dailyGoal.completed >= dailyGoal.target ? 'var(--color-status-easy)' : 'var(--color-status-medium)'}
                  strokeWidth="8"
                  strokeDasharray={`${(Math.min(1, dailyGoal.completed / dailyGoal.target)) * 251.2} 251.2`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{dailyGoal.completed}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-dark-muted)', fontWeight: 600 }}>of {dailyGoal.target}</span>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
            {dailyGoal.message}
          </p>
        </div>

        {/* Weak Topics (AI-Powered) */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--color-status-hard)" /> AI Weakness Detection
          </h3>
          {weakList.length === 0 ? (
            <p style={{ color: 'var(--color-dark-muted)', textAlign: 'center', padding: '2rem 0' }}>
              Solve more problems to unlock AI weakness analysis!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {weakList.map((w, i) => {
                const pColors = priorityColors[w.priority] || priorityColors.medium;
                return (
                  <div key={i} style={{
                    backgroundColor: pColors.bg, border: `1px solid ${pColors.border}`,
                    borderRadius: '0.75rem', padding: '1.25rem',
                    animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{w.topic}</span>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                        color: pColors.text, backgroundColor: `${pColors.text}15`,
                        padding: '0.15rem 0.4rem', borderRadius: '3px',
                      }}>{w.priority}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--color-status-easy)', fontWeight: 600 }}>E:{w.easy}</span>
                      <span style={{ color: 'var(--color-status-medium)', fontWeight: 600 }}>M:{w.medium}</span>
                      <span style={{ color: 'var(--color-status-hard)', fontWeight: 600 }}>H:{w.hard}</span>
                      <span style={{ color: 'var(--color-dark-muted)' }}>{w.completionPct}% complete</span>
                    </div>
                    <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${w.completionPct}%`, height: '100%', backgroundColor: pColors.text, borderRadius: '2px' }}></div>
                    </div>
                    <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>{w.suggestion}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Topic Mastery Distribution */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--color-primary)" /> Skill Distribution — Topic Mastery
        </h3>
        {topicStats.length === 0 ? (
          <p style={{ color: 'var(--color-dark-muted)', textAlign: 'center', padding: '2rem 0' }}>No topics tracked yet. Start solving!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topicStats.map((t) => {
              const maxSolved = topicStats[0]?.solved || 1;
              const pct = Math.round((t.solved / maxSolved) * 100);
              const color = pct >= 70 ? 'var(--color-status-easy)' : pct >= 40 ? 'var(--color-primary)' : pct >= 20 ? 'var(--color-status-medium)' : 'var(--color-status-hard)';
              return (
                <div key={t.topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-dark-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    <span>{t.topic}</span>
                    <span style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ color: 'var(--color-status-easy)' }}>E:{t.easy}</span>
                      <span style={{ color: 'var(--color-status-medium)' }}>M:{t.medium}</span>
                      <span style={{ color: 'var(--color-status-hard)' }}>H:{t.hard}</span>
                      <span style={{ color: 'white', fontWeight: 700 }}>{t.solved} total</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', backgroundColor: color,
                      borderRadius: '3px', transition: 'width 0.8s ease',
                      animation: 'progressFill 1s ease',
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={18} color="#F0883E" /> AI Recommendations
        </h3>
        {recs.length === 0 ? (
          <p style={{ color: 'var(--color-dark-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Solve problems to get personalized recommendations!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {recs.map((rec, i) => {
              const pColors = priorityColors[rec.priority] || priorityColors.medium;
              return (
                <div key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '0.75rem', padding: '1.25rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  transition: 'all 0.2s',
                  animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{rec.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{rec.title}</h4>
                      <span style={{
                        fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                        color: pColors.text, padding: '0.1rem 0.3rem', borderRadius: '2px',
                        backgroundColor: `${pColors.text}10`,
                      }}>{rec.priority}</span>
                    </div>
                    <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
