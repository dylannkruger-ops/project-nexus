import { useState, useEffect } from 'react';

const AGENT_TYPES = [
  { type: 'research',  count: 16, color: '#3b82f6', icon: '🔬' },
  { type: 'writer',    count: 18, color: '#8b5cf6', icon: '✍️' },
  { type: 'coder',     count: 12, color: '#10b981', icon: '💻' },
  { type: 'analyst',   count: 12, color: '#f59e0b', icon: '📊' },
  { type: 'planner',   count: 6,  color: '#ec4899', icon: '🗺️' },
  { type: 'ops',       count: 6,  color: '#06b6d4', icon: '⚙️' },
  { type: 'critic',    count: 6,  color: '#ef4444', icon: '🔍' },
  { type: 'learner',   count: 4,  color: '#a855f7', icon: '🧠' },
  { type: 'monitor',   count: 2,  color: '#14b8a6', icon: '👁️' },
  { type: 'synth',     count: 2,  color: '#eab308', icon: '🌀' },
  { type: 'content',   count: 8,  color: '#f97316', icon: '🎬' },
  { type: 'publisher', count: 8,  color: '#22c55e', icon: '📡' },
];

export default function AgentGrid({ liveActivity = [] }) {
  const [agents, setAgents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Build flat list of 100 agents
    const list = [];
    let idx = 0;
    for (const t of AGENT_TYPES) {
      for (let i = 0; i < t.count; i++) {
        list.push({
          id: `${t.type}-${i}`,
          index: idx++,
          type: t.type,
          color: t.color,
          icon: t.icon,
          status: 'idle',
          task: null,
        });
      }
    }
    setAgents(list);
  }, []);

  // Update agent states from live activity stream
  useEffect(() => {
    if (!liveActivity.length) return;
    setAgents(prev => {
      const next = [...prev];
      for (const evt of liveActivity.slice(-20)) {
        if (evt.type === 'agent.start' && evt.agentId) {
          const found = next.find(a => a.id === evt.agentId);
          if (found) {
            found.status = 'working';
            found.task = evt.task;
          }
        }
        if (evt.type === 'agent.done' && evt.agentId) {
          const found = next.find(a => a.id === evt.agentId);
          if (found) {
            found.status = 'idle';
            found.task = null;
          }
        }
      }
      return next;
    });
  }, [liveActivity]);

  const filtered = filter === 'all' ? agents : agents.filter(a => a.type === filter);
  const working = agents.filter(a => a.status === 'working').length;

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Agent Pool</h2>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            {working} active · {agents.length - working} idle · {agents.length} total
          </div>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            padding: '8px 14px',
            borderRadius: 6,
            fontFamily: 'inherit',
          }}
        >
          <option value="all">All types ({agents.length})</option>
          {AGENT_TYPES.map(t => (
            <option key={t.type} value={t.type}>
              {t.icon} {t.type} ({t.count})
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
        gap: 6,
      }}>
        {filtered.map(agent => (
          <div
            key={agent.id}
            title={`${agent.id}${agent.task ? '\n→ ' + agent.task : ''}`}
            style={{
              aspectRatio: '1',
              background: agent.status === 'working' ? agent.color : '#1a1a1a',
              border: `1px solid ${agent.status === 'working' ? agent.color : '#2a2a2a'}`,
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: agent.status === 'working' ? '#000' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: agent.status === 'working'
                ? `0 0 12px ${agent.color}88`
                : 'none',
            }}
          >
            <span style={{ fontSize: 16 }}>{agent.icon}</span>
            <span style={{ fontSize: 9, marginTop: 2 }}>{agent.index}</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        padding: 16,
        background: '#0f0f0f',
        borderRadius: 8,
        border: '1px solid #2a2a2a',
      }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>Pool composition</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AGENT_TYPES.map(t => (
            <div key={t.type} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: '#1a1a1a',
              borderRadius: 12,
              fontSize: 11,
            }}>
              <span style={{
                width: 8,
                height: 8,
                background: t.color,
                borderRadius: '50%',
              }} />
              <span>{t.type}</span>
              <span style={{ color: '#666' }}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
