import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Flame, Bot, ArrowRight, TrendingUp, Target, Award, RefreshCw, Link2, Wifi } from 'lucide-react';
import api from '../services/api';

// ── Heatmap (LeetCode Style) ──────────────────────────────────────────────────
const HeatmapGrid = ({ heatmap = [], availableYears = [], yearlyData = {}, streak = 0 }) => {
  const [selectedYear, setSelectedYear] = useState('current');
  const [hoveredCell, setHoveredCell] = useState(null);

  // Get active year's data dynamically
  const currentData = (yearlyData && yearlyData[selectedYear]) || {
    heatmap: heatmap || [],
    totalSubmissions: 0,
    activeDays: 0,
  };

  const activeHeatmap = currentData.heatmap || [];
  const displaySubmissions = currentData.totalSubmissions;
  const displayActiveDays = currentData.activeDays;

  if (!activeHeatmap || activeHeatmap.length === 0)
    return <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No activity yet. Start solving!</p>;

  // LeetCode-inspired colors (dark theme)
  const COLORS = [
    '#161b22', // 0 solved
    '#0e4429', // 1-2 solved
    '#006d32', // 3-4 solved
    '#26a641', // 5-6 solved
    '#39d353', // 7+ solved
  ];

  const getLvl = c => {
    if (c === 0) return 0;
    if (c <= 2) return 1;
    if (c <= 4) return 2;
    if (c <= 6) return 3;
    return 4;
  };

  const first = new Date(activeHeatmap[0].date);
  const pad = first.getDay(); // 0=Sunday, 1=Monday, etc.
  const padded = [...Array(pad).fill(null), ...activeHeatmap];
  
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Submissions summary stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{displaySubmissions.toLocaleString()}</span>
          <span style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', marginLeft: '6px', fontWeight: 500 }}>
            {selectedYear === 'current' ? 'submissions in the past one year' : `submissions in ${selectedYear}`}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', cursor: 'help', color: 'var(--color-dark-muted)', opacity: 0.7 }} title="Aggregated daily submissions from all connected platforms (LeetCode, GFG, Codeforces) and manual tracks.">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--color-dark-muted)' }}>
          <div>
            Total active days: <span style={{ color: 'white', fontWeight: 700 }}>{displayActiveDays}</span>
          </div>
          <div>
            Streak: <span style={{ color: '#FF9F0A', fontWeight: 700 }}>{streak} day{streak !== 1 ? 's' : ''}</span>
          </div>

          {/* Premium Year Selector Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                appearance: 'none',
                backgroundColor: '#262626',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '6px',
                color: 'white',
                padding: '5px 28px 5px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#323232';
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#262626';
                e.target.style.borderColor = 'var(--color-dark-border)';
              }}
            >
              <option value="current">Current</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-dark-muted)', fontSize: '0.55rem' }}>
              ▼
            </div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content', padding: '0.5rem 0' }}>
          {/* Day labels (Mon, Wed, Fri labeled exactly like LeetCode) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '16px', marginRight: '4px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} style={{ width: '22px', height: '12px', fontSize: '0.55rem', color: '#8b949e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', lineHeight: '12px' }}>
                {[1, 3, 5].includes(i) ? d : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((week, wi) => {
              const firstRealDay = week.find(d => d !== null);
              const showMonth = firstRealDay && new Date(firstRealDay.date).getDate() <= 7;
              const monthName = firstRealDay ? new Date(firstRealDay.date).toLocaleString('default', { month: 'short' }) : '';
              
              return (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Month header label block */}
                  <div style={{ height: '16px', fontSize: '0.58rem', color: '#8b949e', overflow: 'visible', whiteSpace: 'nowrap', width: '12px' }}>
                    {showMonth ? monthName : ''}
                  </div>

                  {/* The 7 days in the week column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {week.map((day, di) => {
                      const count = day ? day.count : 0;
                      const dateStr = day ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                      const color = COLORS[getLvl(count)];
                      
                      return (
                        <div
                          key={di}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            backgroundColor: day ? color : 'transparent',
                            border: day ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid transparent',
                            cursor: day ? 'pointer' : 'default',
                            transition: 'transform 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!day) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const parentRect = e.currentTarget.offsetParent.getBoundingClientRect();
                            setHoveredCell({
                              count,
                              date: dateStr,
                              x: rect.left - parentRect.left + 6,
                              y: rect.top - parentRect.top - 34,
                            });
                            e.currentTarget.style.transform = 'scale(1.25)';
                            e.currentTarget.style.zIndex = '10';
                          }}
                          onMouseLeave={(e) => {
                            setHoveredCell(null);
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.zIndex = '1';
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Elegant Floating Custom Tooltip */}
      {hoveredCell && (
        <div style={{
          position: 'absolute',
          top: hoveredCell.y,
          left: hoveredCell.x,
          transform: 'translateX(-50%)',
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 100,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <div>
            <span style={{ color: hoveredCell.count > 0 ? '#39d353' : 'var(--color-dark-muted)' }}>
              {hoveredCell.count} problem{hoveredCell.count !== 1 ? 's' : ''} solved
            </span>
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--color-dark-muted)' }}>{hoveredCell.date}</div>
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            backgroundColor: '#161b22',
            borderRight: '1px solid #30363d',
            borderBottom: '1px solid #30363d',
          }} />
        </div>
      )}

      {/* Legend below the grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--color-dark-muted)', letterSpacing: '1px' }}>
          {selectedYear === 'current' ? 'LAST 365 DAYS' : `YEAR ${selectedYear}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--color-dark-muted)', marginRight: '4px' }}>Less</span>
          {COLORS.map((c, i) => (
            <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: c, border: '1px solid rgba(255,255,255,0.03)' }} />
          ))}
          <span style={{ fontSize: '0.62rem', color: 'var(--color-dark-muted)', marginLeft: '4px' }}>More</span>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, pct, ringColor }) => (
  <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `conic-gradient(${ringColor} ${pct}%, rgba(255,255,255,0.04) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'var(--color-dark-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>{pct}%</span>
      </div>
    </div>
  </div>
);

const MasteryBar = ({ topic, count, pct, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginBottom: '0.4rem' }}>
      <span style={{ textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{topic}</span>
      <span>{count} solved</span>
    </div>
    <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: pct, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

const DiffBadge = ({ diff }) => {
  const cfg = {
    EASY: { bg: 'rgba(63,185,80,0.1)', color: 'var(--color-status-easy)', border: 'rgba(63,185,80,0.25)' },
    MEDIUM: { bg: 'rgba(210,153,34,0.1)', color: 'var(--color-status-medium)', border: 'rgba(210,153,34,0.25)' },
    HARD: { bg: 'rgba(248,81,73,0.1)', color: 'var(--color-status-hard)', border: 'rgba(248,81,73,0.25)' },
  };
  const c = cfg[diff] || cfg.EASY;
  return <span style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>{diff}</span>;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [skillLevel, setSkillLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, platformRes, aiRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/platforms').catch(() => ({ data: [] })),
        api.get('/ai/weak-topics').catch(() => ({ data: {} })),
      ]);
      setData(summaryRes.data);
      setPlatforms(platformRes.data);
      setSkillLevel(aiRes.data?.skillLevel);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, [fetchData]);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try { await api.post('/platforms/sync-all'); await fetchData(); } catch { }
    finally { setSyncingAll(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-dark-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--color-dark-muted)' }}>Loading your dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const total = data?.total || 0;
  const easy = data?.easy || 0;
  const medium = data?.medium || 0;
  const hard = data?.hard || 0;
  const streak = data?.streak || 0;
  const recent = data?.recent || [];
  const heatmap = data?.heatmap || [];
  const topicStats = data?.topicStats || [];
  const weakTopic = data?.weakTopics?.[0];
  const maxTopicSolved = topicStats[0]?.solved || 1;
  const connectedPlatforms = platforms.filter(p => p.isConnected);

  const PLATFORM_COLORS = {
    leetcode: { color: '#FFA116', icon: '🟠', name: 'LeetCode' },
    codeforces: { color: '#318CE7', icon: '🔵', name: 'Codeforces' },
    gfg: { color: '#2F8D46', icon: '🟢', name: 'GFG' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            Hello, {user?.name?.split(' ')[0] || 'Coder'}! 👋
          </h1>
          <p style={{ color: 'var(--color-dark-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{streak} Day Streak <Flame size={16} color="#FF9F0A" /></span>
            {skillLevel && <><span style={{ color: 'var(--color-dark-border)' }}>|</span><span style={{ color: skillLevel.color, fontWeight: 600 }}>{skillLevel.icon} {skillLevel.level}</span></>}
            <span style={{ color: 'var(--color-dark-border)' }}>|</span>
            <span style={{ color: '#FF9F0A' }}>{total === 0 ? 'Start solving to build your streak!' : `${total} problems solved total`}</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {connectedPlatforms.length > 0 && (
            <button onClick={handleSyncAll} disabled={syncingAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, var(--color-primary), #a78bfa)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', opacity: syncingAll ? 0.7 : 1 }}>
              <RefreshCw size={14} style={syncingAll ? { animation: 'spin 1s linear infinite' } : {}} />
              {syncingAll ? 'Syncing...' : 'Sync All'}
            </button>
          )}
          <button onClick={fetchData} title="Refresh" style={{ width: '36px', height: '36px', borderRadius: '0.5rem', backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark-muted)', cursor: 'pointer' }}>↻</button>
        </div>
      </div>

      {/* Connect platforms banner */}
      {connectedPlatforms.length === 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.08), rgba(167,139,250,0.08))', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(88,166,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Link2 size={24} color="var(--color-primary)" /></div>
            <div>
              <h3 style={{ fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Connect Your Coding Platforms</h3>
              <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>Link LeetCode, Codeforces, or GFG to auto-sync all your solved problems.</p>
            </div>
          </div>
          <a href="/platforms" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'white', borderRadius: '0.5rem', fontWeight: 700, textDecoration: 'none' }}><Link2 size={16} /> Connect Now</a>
        </div>
      )}

      {/* Connected platform mini-cards */}
      {connectedPlatforms.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(connectedPlatforms.length, 3)}, 1fr)`, gap: '1rem' }}>
          {connectedPlatforms.map(p => {
            const cfg = PLATFORM_COLORS[p.platform] || {};
            return (
              <div key={p.platform} style={{ backgroundColor: 'var(--color-dark-800)', border: `1px solid ${cfg.color}30`, borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{cfg.name}</div>
                  <div style={{ fontSize: '0.7rem', color: cfg.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Wifi size={10} /> @{p.username}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{p.stats?.totalSolved || 0}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--color-dark-muted)', fontWeight: 600 }}>SOLVED</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <StatCard label="TOTAL SOLVED" value={total} color="white" pct={Math.min(100, Math.round((total / 500) * 100))} ringColor="var(--color-primary)" />
        <StatCard label="EASY" value={easy} color="var(--color-status-easy)" pct={total > 0 ? Math.round((easy / total) * 100) : 0} ringColor="var(--color-status-easy)" />
        <StatCard label="MEDIUM" value={medium} color="var(--color-status-medium)" pct={total > 0 ? Math.round((medium / total) * 100) : 0} ringColor="var(--color-status-medium)" />
        <StatCard label="HARD" value={hard} color="var(--color-status-hard)" pct={total > 0 ? Math.round((hard / total) * 100) : 0} ringColor="var(--color-status-hard)" />
      </div>

      {/* Activity Heatmap (Full-Width Year-Wise) */}
      <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <HeatmapGrid 
          heatmap={heatmap} 
          availableYears={data?.availableYears}
          yearlyData={data?.yearlyData}
          streak={streak}
        />
      </div>

      {/* Middle grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Topic Mastery */}
        <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--color-primary)" /> Topic Mastery
          </h3>
          {topicStats.length === 0
            ? <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>Sync your platforms to see topic mastery!</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {topicStats.slice(0, 5).map((t, i) => {
                  const colors = ['#c084fc', '#e879f9', '#a78bfa', '#818cf8', '#60a5fa'];
                  const pct = Math.round((t.solved / (maxTopicSolved || 1)) * 100);
                  return <MasteryBar key={t.topic} topic={t.topic} count={t.solved} pct={`${pct}%`} color={colors[i % colors.length]} />;
                })}
              </div>
          }
        </div>

        {/* AI Insight */}
        <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={18} color="#a78bfa" /> AI Insight</h3>
          {weakTopic ? (
            <>
              <div style={{ backgroundColor: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Weakest Topic</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{weakTopic.topic}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)' }}>{weakTopic.solved} problem{weakTopic.solved !== 1 ? 's' : ''} solved</p>
              </div>
              <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', lineHeight: 1.7, flex: 1 }}>{weakTopic.suggestion}</p>
            </>
          ) : (
            <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', lineHeight: 1.7, flex: 1 }}>
              {connectedPlatforms.length === 0 ? 'Connect your coding platforms to get personalized AI recommendations.' : 'Start solving problems to get personalized AI insights.'}
            </p>
          )}
          <a href="/analytics" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', color: 'var(--color-dark-text)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
            View Analytics <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Recent Problems */}
      <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Recent Solved Problems</h3>
          <a href="/questions" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>View All →</a>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-dark-muted)' }}>
            <Award size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'white' }}>No problems solved yet!</p>
            <p style={{ fontSize: '0.875rem' }}>{connectedPlatforms.length === 0 ? 'Connect your coding platforms to auto-import.' : 'Click "Sync All" to fetch your latest solved problems.'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['TITLE','TOPIC','DIFFICULTY','PLATFORM','DATE'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.65rem', color: 'var(--color-dark-muted)', fontWeight: 700, letterSpacing: '1px', borderBottom: '1px solid var(--color-dark-border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recent.map((q, i) => (
                <tr key={q._id} style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--color-dark-border)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.9rem 0', color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>{q.title}</td>
                  <td style={{ padding: '0.9rem 0', color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>{q.topic}</td>
                  <td style={{ padding: '0.9rem 0' }}><DiffBadge diff={q.difficulty} /></td>
                  <td style={{ padding: '0.9rem 0', color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>
                    {q.platform === 'LeetCode' && '🟠'}{q.platform === 'Codeforces' && '🔵'}{q.platform === 'GFG' && '🟢'} {q.platform}
                  </td>
                  <td style={{ padding: '0.9rem 0', color: 'var(--color-dark-muted)', fontSize: '0.8rem' }}>
                    {new Date(q.solvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total === 0 && connectedPlatforms.length === 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.08), rgba(167,139,250,0.08))', border: '1px solid rgba(88,166,255,0.2)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
          <Target size={40} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '0.5rem' }}>Ready to start tracking?</h3>
          <p style={{ color: 'var(--color-dark-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Connect your coding platform and watch your stats come alive!</p>
          <a href="/platforms" style={{ display: 'inline-block', padding: '0.75rem 2rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '0.5rem', fontWeight: 700, textDecoration: 'none' }}>🔗 Connect Platforms</a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
