import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Unlink, RefreshCw, CheckCircle2, XCircle, Clock,
  Loader2, Zap, Trophy, TrendingUp, ExternalLink, Wifi, WifiOff
} from 'lucide-react';
import api from '../services/api';

const PLATFORM_CONFIG = {
  leetcode: {
    name: 'LeetCode',
    color: '#FFA116',
    gradient: 'linear-gradient(135deg, rgba(255,161,22,0.1), rgba(255,161,22,0.02))',
    border: 'rgba(255,161,22,0.3)',
    icon: '🟠',
    url: 'https://leetcode.com',
    placeholder: 'e.g., john_doe',
    description: 'Sync your solved problems, difficulty stats, and ranking from LeetCode.',
  },
  codeforces: {
    name: 'Codeforces',
    color: '#318CE7',
    gradient: 'linear-gradient(135deg, rgba(49,140,231,0.1), rgba(49,140,231,0.02))',
    border: 'rgba(49,140,231,0.3)',
    icon: '🔵',
    url: 'https://codeforces.com',
    placeholder: 'e.g., tourist',
    description: 'Auto-import your contest submissions, ratings, and problem history.',
  },
  gfg: {
    name: 'GeeksForGeeks',
    color: '#2F8D46',
    gradient: 'linear-gradient(135deg, rgba(47,141,70,0.1), rgba(47,141,70,0.02))',
    border: 'rgba(47,141,70,0.3)',
    icon: '🟢',
    url: 'https://geeksforgeeks.org',
    placeholder: 'e.g., gfg_user123',
    description: 'Fetch your GFG profile stats and coding score automatically.',
  },
};

const Platforms = () => {
  const [platforms, setPlatforms] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null); // platform being connected
  const [syncing, setSyncing] = useState(null); // platform being synced
  const [syncingAll, setSyncingAll] = useState(false);
  const [formData, setFormData] = useState({ leetcode: '', codeforces: '', gfg: '' });
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [platformRes, logsRes] = await Promise.all([
        api.get('/platforms'),
        api.get('/platforms/sync-logs'),
      ]);
      setPlatforms(platformRes.data);
      setSyncLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConnect = async (platform) => {
    const username = formData[platform]?.trim();
    if (!username) return showToast('Please enter a username', 'error');

    setConnecting(platform);
    try {
      await api.post('/platforms/connect', { platform, username });
      showToast(`✅ Connected to ${PLATFORM_CONFIG[platform].name}!`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Connection failed', 'error');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Disconnect from ${PLATFORM_CONFIG[platform].name}?`)) return;
    try {
      await api.delete(`/platforms/${platform}`);
      showToast(`Disconnected from ${PLATFORM_CONFIG[platform].name}`);
      fetchData();
    } catch (err) {
      showToast('Failed to disconnect', 'error');
    }
  };

  const handleSync = async (platform) => {
    setSyncing(platform);
    try {
      const res = await api.post(`/platforms/sync/${platform}`);
      showToast(`🔄 ${res.data.message}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Sync failed', 'error');
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await api.post('/platforms/sync-all');
      const successes = res.data.results?.filter(r => r.status === 'success').length || 0;
      showToast(`🔄 Synced ${successes} platform(s) successfully!`);
      fetchData();
    } catch (err) {
      showToast('Sync failed', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  const getAccount = (platform) => platforms.find(p => p.platform === platform);
  const connectedCount = platforms.filter(p => p.isConnected).length;

  const cardStyle = {
    backgroundColor: 'var(--color-dark-800)',
    border: '1px solid var(--color-dark-border)',
    borderRadius: '1rem',
    padding: '2rem',
    transition: 'all 0.3s ease',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-dark-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--color-dark-muted)' }}>Loading platforms...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000,
          padding: '1rem 1.5rem', borderRadius: '0.75rem',
          backgroundColor: toast.type === 'error' ? 'rgba(248,81,73,0.15)' : 'rgba(63,185,80,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(248,81,73,0.3)' : 'rgba(63,185,80,0.3)'}`,
          color: toast.type === 'error' ? 'var(--color-status-hard)' : 'var(--color-status-easy)',
          fontWeight: 600, fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}>
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(88,166,255,0.3); } 50% { box-shadow: 0 0 20px 5px rgba(88,166,255,0.15); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            🔗 Platform Connections
          </h1>
          <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.95rem' }}>
            Connect your coding accounts to auto-sync all your solved problems.
            <span style={{ color: 'var(--color-primary)', fontWeight: 600, marginLeft: '0.5rem' }}>
              {connectedCount}/3 connected
            </span>
          </p>
        </div>
        {connectedCount > 0 && (
          <button onClick={handleSyncAll} disabled={syncingAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, var(--color-primary), #a78bfa)',
              color: 'white', border: 'none', borderRadius: '0.75rem',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              opacity: syncingAll ? 0.7 : 1,
              animation: syncingAll ? 'pulseGlow 2s infinite' : 'none',
            }}>
            {syncingAll ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={18} />}
            {syncingAll ? 'Syncing All...' : 'Sync All Platforms'}
          </button>
        )}
      </div>

      {/* Platform Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
          const account = getAccount(key);
          const isConnected = account?.isConnected;
          const isSyncing = syncing === key;
          const isConnecting = connecting === key;

          return (
            <div key={key} style={{
              ...cardStyle,
              background: isConnected ? config.gradient : cardStyle.backgroundColor,
              borderColor: isConnected ? config.border : 'var(--color-dark-border)',
            }}>
              {/* Platform Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{config.icon}</span>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'white' }}>{config.name}</h3>
                    {isConnected && (
                      <span style={{ fontSize: '0.75rem', color: config.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Wifi size={12} /> Connected as @{account.username}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: isConnected ? `${config.color}15` : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${isConnected ? config.border : 'var(--color-dark-border)'}`,
                }}>
                  {isConnected ? <CheckCircle2 size={18} color={config.color} /> : <WifiOff size={18} color="var(--color-dark-muted)" />}
                </div>
              </div>

              {/* Stats (if connected) */}
              {isConnected && account.stats && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
                  padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
                  backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <StatMini label="Easy" value={account.stats.easySolved} color="var(--color-status-easy)" />
                  <StatMini label="Medium" value={account.stats.mediumSolved} color="var(--color-status-medium)" />
                  <StatMini label="Hard" value={account.stats.hardSolved} color="var(--color-status-hard)" />
                </div>
              )}

              {/* Description */}
              {!isConnected && (
                <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {config.description}
                </p>
              )}

              {/* Connect Form or Actions */}
              {!isConnected ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={config.placeholder}
                    value={formData[key]}
                    onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleConnect(key)}
                    className="input-field"
                    style={{ flex: 1, fontSize: '0.875rem' }}
                  />
                  <button onClick={() => handleConnect(key)} disabled={isConnecting}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none',
                      backgroundColor: config.color, color: 'white', fontWeight: 700,
                      cursor: 'pointer', opacity: isConnecting ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                    }}>
                    {isConnecting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={14} />}
                    {isConnecting ? 'Verifying...' : 'Connect'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleSync(key)} disabled={isSyncing}
                    style={{
                      flex: 1, padding: '0.6rem 1rem', borderRadius: '0.5rem',
                      border: `1px solid ${config.border}`,
                      backgroundColor: `${config.color}10`, color: config.color,
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      opacity: isSyncing ? 0.6 : 1,
                    }}>
                    {isSyncing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button onClick={() => handleDisconnect(key)}
                    style={{
                      padding: '0.6rem 0.8rem', borderRadius: '0.5rem',
                      border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.05)',
                      color: 'var(--color-status-hard)', cursor: 'pointer', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                    <Unlink size={14} />
                  </button>
                </div>
              )}

              {/* Last sync info */}
              {isConnected && account.lastSyncAt && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--color-dark-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={10} /> Last synced: {new Date(account.lastSyncAt).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Sync History */}
      {syncLogs.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--color-primary)" /> Sync History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {syncLogs.slice(0, 10).map((log, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {log.status === 'success' ? <CheckCircle2 size={16} color="var(--color-status-easy)" /> : <XCircle size={16} color="var(--color-status-hard)" />}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white', textTransform: 'capitalize' }}>{log.platform}</span>
                    {log.questionsAdded > 0 && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-status-easy)' }}>
                        +{log.questionsAdded} new
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem' }}>
          ⚡ How Auto-Sync Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Connect Account', desc: 'Enter your username for each platform. We verify it exists.' },
            { step: '02', title: 'Auto-Fetch', desc: 'We fetch your solved problems, difficulty levels, and tags automatically.' },
            { step: '03', title: 'Smart Tracking', desc: 'Problems are categorized by topic and difficulty for AI analytics.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '0.5rem', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(88,166,255,0.15), rgba(167,139,250,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-primary)',
              }}>{s.step}</div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{s.title}</h4>
                <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: 'var(--color-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
  </div>
);

export default Platforms;
