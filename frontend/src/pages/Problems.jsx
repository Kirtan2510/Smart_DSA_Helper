import React from 'react';
import { Search, ChevronDown, Filter, Globe, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import './Problems.css';

const Problems = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Problem Repository</h1>
          <p className="page-subtitle">Curate and track your algorithmic journey through focused problem management.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#BAC5FB', color: '#171A21', fontWeight: 700 }}>
          <Plus size={18} /> Add New Question
        </button>
      </div>

      <div className="card filters-card">
        <div className="search-bar">
          <Search size={18} color="var(--text-secondary)" />
          <input type="text" placeholder="Search by title, platform..." className="search-input" />
        </div>
        <div className="dropdown">
          <span>Topic: All</span>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
        <div className="dropdown">
          <span>Difficulty</span>
          <Filter size={16} color="var(--text-secondary)" />
        </div>
        <div className="dropdown">
          <span>Platform</span>
          <Globe size={16} color="var(--text-secondary)" />
        </div>
      </div>

      <div className="card table-card">
        <table className="repository-table">
          <thead>
            <tr>
              <th>PROBLEM TITLE</th>
              <th>TOPIC</th>
              <th>DIFFICULTY</th>
              <th>NOTES</th>
              <th>SOLVED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="problem-title-cell">
                  <strong>Trapping Rain Water</strong>
                  <span className="problem-meta">LeetCode #42</span>
                </div>
              </td>
              <td><span className="topic-badge">Two Pointers</span></td>
              <td><span className="badge badge-hard">HARD</span></td>
              <td className="notes-col">Solved using monotonic stac...</td>
              <td className="date-col">
                <span>Nov 24,</span>
                <span className="text-secondary">2024</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <div className="problem-title-cell">
                  <strong>Merge Intervals</strong>
                  <span className="problem-meta">LeetCode #56</span>
                </div>
              </td>
              <td><span className="topic-badge">Arrays</span></td>
              <td><span className="badge badge-medium">MEDIUM</span></td>
              <td className="notes-col">Focus on sorting starting tim...</td>
              <td className="date-col">
                <span>Nov 22,</span>
                <span className="text-secondary">2024</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <div className="problem-title-cell">
                  <strong>Valid Parentheses</strong>
                  <span className="problem-meta">LeetCode #20</span>
                </div>
              </td>
              <td><span className="topic-badge">Stacks</span></td>
              <td><span className="badge badge-easy">EASY</span></td>
              <td className="notes-col">Classic stack application.</td>
              <td className="date-col">
                <span>Nov 20,</span>
                <span className="text-secondary">2024</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <div className="problem-title-cell">
                  <strong>Longest Path in a DAG</strong>
                  <span className="problem-meta">Custom #12</span>
                </div>
              </td>
              <td><span className="topic-badge">Graphs</span></td>
              <td><span className="badge badge-hard">HARD</span></td>
              <td className="notes-col">Topological sort then DP.</td>
              <td className="date-col">
                <span>Nov 18,</span>
                <span className="text-secondary">2024</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing <strong>1 - 4</strong> of <strong>42</strong> problems</span>
          <div className="pagination-controls">
            <button className="page-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">11</button>
            <button className="page-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <div className="logo-sm">Smart DSA</div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">API Docs</a>
          <a href="#">Contact Support</a>
        </div>
        <p className="copyright">© 2024 Smart DSA Tracker. Engineered for Performance.</p>
      </footer>
    </div>
  );
};

export default Problems;
