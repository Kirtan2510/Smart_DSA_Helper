import React, { useEffect, useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const TOPICS = ['All', 'Array', 'Linked List', 'Tree', 'Graph', 'Dynamic Programming', 'Stack', 'Queue', 'Binary Search', 'Greedy', 'Backtracking'];
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD'];
const PLATFORMS = ['All', 'LeetCode', 'CodeChef', 'Codeforces', 'GFG', 'HackerRank'];

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [filters, setFilters] = useState({ topic: '', difficulty: '', platform: '', search: '' });
  const [form, setForm] = useState({ title: '', topic: 'Array', difficulty: 'EASY', platform: 'LeetCode', notes: '' });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.topic && filters.topic !== 'All') params.topic = filters.topic;
      if (filters.difficulty && filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.platform && filters.platform !== 'All') params.platform = filters.platform;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/questions', { params });
      setQuestions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQ) {
        await api.put(`/questions/${editingQ._id}`, form);
      } else {
        await api.post('/questions', form);
      }
      setShowModal(false);
      setEditingQ(null);
      setForm({ title: '', topic: 'Array', difficulty: 'EASY', platform: 'LeetCode', notes: '' });
      fetchQuestions();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try { await api.delete(`/questions/${id}`); fetchQuestions(); } catch (err) { console.error(err); }
  };

  const handleEdit = (q) => {
    setEditingQ(q);
    setForm({ title: q.title, topic: q.topic, difficulty: q.difficulty, platform: q.platform, notes: q.notes });
    setShowModal(true);
  };

  const cardStyle = { backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1.5rem' };
  const selectStyle = { backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', color: 'var(--color-dark-text)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Problem Repository</h1>
          <p style={{ color: 'var(--color-dark-muted)', fontSize: '0.95rem' }}>Curate and track your algorithmic journey.</p>
        </div>
        <button onClick={() => { setEditingQ(null); setForm({ title: '', topic: 'Array', difficulty: 'EASY', platform: 'LeetCode', notes: '' }); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', flex: '1', minWidth: '200px' }}>
          <Search size={16} color="var(--color-dark-muted)" />
          <input type="text" placeholder="Search by title..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-dark-text)', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
        </div>
        <select style={selectStyle} value={filters.topic} onChange={e => setFilters(f => ({ ...f, topic: e.target.value }))}>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select style={selectStyle} value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select style={selectStyle} value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(22,27,34,0.5)' }}>
              {['PROBLEM TITLE', 'TOPIC', 'DIFFICULTY', 'NOTES', 'SOLVED DATE', 'ACTIONS'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.7rem', color: 'var(--color-dark-muted)', fontWeight: 700, letterSpacing: '1px', borderBottom: '1px solid var(--color-dark-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-dark-muted)' }}>Loading...</td></tr>
            ) : questions.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-dark-muted)' }}>No questions found. Add your first one!</td></tr>
            ) : questions.map((q) => (
              <tr key={q._id} style={{ borderBottom: '1px solid var(--color-dark-border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>{q.title}</div>
                  <div style={{ color: 'var(--color-dark-muted)', fontSize: '0.75rem' }}>{q.platform}</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-dark-border)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--color-dark-muted)' }}>{q.topic}</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}><DiffBadge diff={q.difficulty} /></td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-dark-muted)', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.notes || '—'}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-dark-muted)', fontSize: '0.8rem' }}>{new Date(q.solvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(q)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-dark-border)', backgroundColor: 'transparent', color: 'var(--color-dark-muted)', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(q._id)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(248,81,73,0.3)', backgroundColor: 'rgba(248,81,73,0.1)', color: 'var(--color-status-hard)', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-muted)' }}>Showing <strong style={{ color: 'white' }}>{questions.length}</strong> problems</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--color-dark-border)', backgroundColor: 'transparent', color: 'var(--color-dark-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} /></button>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#BAC5FB', color: '#161B22', fontWeight: 700, cursor: 'pointer' }}>1</button>
            <button style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--color-dark-border)', backgroundColor: 'transparent', color: 'var(--color-dark-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editingQ ? 'Edit Question' : 'Add New Question'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Problem Title', key: 'title', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-dark-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                  <input type={type} required className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Topic', key: 'topic', options: TOPICS.slice(1) },
                  { label: 'Platform', key: 'platform', options: PLATFORMS.slice(1) },
                  { label: 'Difficulty', key: 'difficulty', options: DIFFICULTIES.slice(1) },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-dark-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                    <select style={{ ...selectStyle, width: '100%' }} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-dark-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</label>
                <textarea rows={3} className="input-field" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingQ ? 'Save Changes' : 'Add Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DiffBadge = ({ diff }) => {
  const cfg = {
    EASY: { bg: 'rgba(63,185,80,0.1)', color: 'var(--color-status-easy)', border: 'rgba(63,185,80,0.25)' },
    MEDIUM: { bg: 'rgba(210,153,34,0.1)', color: 'var(--color-status-medium)', border: 'rgba(210,153,34,0.25)' },
    HARD: { bg: 'rgba(248,81,73,0.1)', color: 'var(--color-status-hard)', border: 'rgba(248,81,73,0.25)' },
  };
  const c = cfg[diff] || cfg.EASY;
  return <span style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '0.2rem 0.7rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>{diff}</span>;
};

export default Questions;
