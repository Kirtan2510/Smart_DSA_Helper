import React, { useEffect, useState, useCallback } from 'react';
import { Play, PlaySquare, Brain, TrendingUp, AlertTriangle, Lightbulb, Link2, MonitorPlay, ExternalLink, Activity, BookOpen, Clock, Calendar } from 'lucide-react';
import api from '../services/api';

const Learn = () => {
  const [behavior, setBehavior] = useState(null);
  const [playlistsData, setPlaylistsData] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); // { id, title, channel }

  const fetchData = useCallback(async () => {
    try {
      const [behaviorRes, playlistsRes, resourcesRes] = await Promise.all([
        api.get('/learn/behavior').catch(() => ({ data: null })),
        api.get('/learn/playlists').catch(() => ({ data: null })),
        api.get('/learn/resources').catch(() => ({ data: null })),
      ]);
      
      setBehavior(behaviorRes.data);
      setPlaylistsData(playlistsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error('Failed to fetch learn data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cardStyle = {
    backgroundColor: 'var(--color-dark-800)',
    border: '1px solid var(--color-dark-border)',
    borderRadius: '1rem',
    padding: '1.5rem',
  };

  const openVideoModal = (video) => {
    setActiveVideo(video);
  };

  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--color-dark-border)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--color-dark-muted)' }}>Analyzing your learning profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const insights = behavior?.insights || [];
  const recommendedPlaylists = playlistsData?.recommended || [];
  const personalizedResources = resources?.personalized || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
          🧠 AI Learning Center
        </h1>
        <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.95rem' }}>
          Deep behavior analysis and personalized curriculum based on your weak areas.
        </p>
      </div>

      {/* Behavior Insights Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--color-primary)" /> Behavioral Insights
        </h2>
        
        {(!behavior || behavior.message) ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
            <Brain size={40} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--color-dark-muted)' }} />
            <p style={{ color: 'white', fontWeight: 600 }}>{behavior?.message || 'Not enough data for analysis'}</p>
            <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Solve at least 5 problems to unlock your behavioral profile.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {/* Core Stats */}
            <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>CONSISTENCY</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: behavior.behavior.consistencyScore >= 70 ? 'var(--color-status-easy)' : 'var(--color-status-medium)' }}>{behavior.behavior.consistencyScore}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>PEAK HOUR</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{behavior.behavior.peakHour}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>DAILY AVG</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{behavior.behavior.avgDailyRate} <span style={{fontSize: '0.8rem', color: 'var(--color-dark-muted)'}}>prob/day</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-dark-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>MAX STREAK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF9F0A' }}>{behavior.behavior.maxStreak} 🔥</div>
              </div>
            </div>

            {/* AI Observations */}
            <div style={{ ...cardStyle, gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-dark-border)', paddingBottom: '0.5rem' }}>AI Observations</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {insights.map((insight, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    padding: '0.75rem', borderRadius: '0.5rem',
                    backgroundColor: insight.type === 'warning' ? 'rgba(248,81,73,0.05)' : 
                                     insight.type === 'strength' ? 'rgba(63,185,80,0.05)' : 'rgba(88,166,255,0.05)',
                    border: `1px solid ${insight.type === 'warning' ? 'rgba(248,81,73,0.1)' : 
                                       insight.type === 'strength' ? 'rgba(63,185,80,0.1)' : 'rgba(88,166,255,0.1)'}`
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{insight.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>{insight.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)', lineHeight: 1.4 }}>{insight.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended YouTube Playlists */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MonitorPlay size={20} color="#FF0000" /> Recommended Video Courses
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {recommendedPlaylists.map((playlist, idx) => (
            <div key={idx} style={{ 
              ...cardStyle, 
              padding: '0', 
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0d0d0d' }}>
                {playlist.thumbnail ? (
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>▶️</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>YouTube Playlist</span>
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                  <button onClick={() => openVideoModal({ id: playlist.id, title: playlist.title, channel: playlist.channel, isPlaylist: true })} style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,0,0,0.9)', 
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    <Play fill="white" color="white" size={20} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
                {playlist.videoCount && (
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {playlist.videoCount} videos
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{playlist.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-dark-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <PlaySquare size={14} /> {playlist.channel}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openVideoModal({ id: playlist.id, title: playlist.title, channel: playlist.channel, isPlaylist: true })} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'var(--color-dark-700)', border: '1px solid var(--color-dark-border)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Play size={14} /> Watch Here
                  </button>
                  <a href={`https://www.youtube.com/playlist?list=${playlist.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#FF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Watch on YouTube">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Learning Platforms & Articles */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="var(--color-status-easy)" /> Top Free Resources For You
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {personalizedResources.map((resource, idx) => (
            <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer" style={{ 
              ...cardStyle, 
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              textDecoration: 'none', transition: 'all 0.2s',
              backgroundColor: 'rgba(255,255,255,0.02)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--color-dark-border)'; }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: `${resource.platformInfo?.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                {resource.platformInfo?.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', lineHeight: 1.4 }}>{resource.title}</h3>
                  <ExternalLink size={14} color="var(--color-dark-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: resource.platformInfo?.color, fontWeight: 600 }}>{resource.platformInfo?.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-dark-muted)' }}>•</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-dark-muted)', backgroundColor: 'var(--color-dark-700)', padding: '2px 6px', borderRadius: '4px' }}>{resource.forTopic}</span>
                  <span style={{ fontSize: '0.65rem', color: resource.difficulty === 'beginner' ? 'var(--color-status-easy)' : resource.difficulty === 'intermediate' ? 'var(--color-status-medium)' : 'var(--color-status-hard)', textTransform: 'uppercase', fontWeight: 700, border: `1px solid ${resource.difficulty === 'beginner' ? 'rgba(63,185,80,0.3)' : resource.difficulty === 'intermediate' ? 'rgba(210,153,34,0.3)' : 'rgba(248,81,73,0.3)'}`, padding: '1px 4px', borderRadius: '3px' }}>{resource.difficulty}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: 'var(--color-dark-900)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-dark-border)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-dark-border)', backgroundColor: 'var(--color-dark-800)' }}>
              <div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{activeVideo.title}</h3>
                <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>{activeVideo.channel}</p>
              </div>
              <button onClick={closeVideoModal} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Close</button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: 'black' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={activeVideo.isPlaylist ? `https://www.youtube.com/embed/videoseries?list=${activeVideo.id}` : `https://www.youtube.com/embed/${activeVideo.id}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-dark-800)', display: 'flex', justifyContent: 'flex-end' }}>
               <a href={activeVideo.isPlaylist ? `https://www.youtube.com/playlist?list=${activeVideo.id}` : `https://www.youtube.com/watch?v=${activeVideo.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF4444', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                 Watch on YouTube <ExternalLink size={16} />
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
