import { useEffect, useState } from 'react';
import AgentGrid from './components/AgentGrid.jsx';
import ContentFeed from './components/ContentFeed.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';

const TABS = ['Agents', 'Content', 'Schedule', 'Tasks', 'Metrics'];

export default function App() {
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [wsEvents, setWsEvents] = useState([]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [s, t, sc, m] = await Promise.all([
          fetch('/api/status').then(r => r.json()).catch(() => null),
          fetch('/api/tasks').then(r => r.json()).catch(() => []),
          fetch('/api/schedule').then(r => r.json()).catch(() => []),
          fetch('/api/metrics').then(r => r.json()).catch(() => null),
        ]);
        setStatus(s);
        setTasks(t);
        setSchedule(sc);
        setMetrics(m);
      } catch (e) {
        console.warn('Refresh failed:', e.message);
      }
    };
    refresh();
    const interval = setInterval(refresh, 5000);

    // WebSocket for live events
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        setWsEvents(prev => [msg, ...prev].slice(0, 100));
      } catch {}
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', color: '#e0e6f0' }}>
      <Header status={status} />
      <div style={{ display: 'flex', borderBottom: '1px solid #1a2040', background: '#080812' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              background: 'none',
              border: 'none',
              color: tab === i ? '#3b82f6' : '#4a5580',
              borderBottom: tab === i ? '2px solid #3b82f6' : '2px solid transparent',
              padding: '12px 22px',
              fontSize: 11,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              fontFamily: 'inherit',
              fontWeight: tab === i ? 600 : 400,
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === 0 && <AgentGrid status={status} />}
        {tab === 1 && <ContentFeed schedule={schedule} events={wsEvents} />}
        {tab === 2 && <ScheduleView schedule={schedule} />}
        {tab === 3 && <TaskFeed tasks={tasks} events={wsEvents} />}
        {tab === 4 && <MetricsPanel metrics={metrics} />}
      </div>
    </div>
  );
}

function Header({ status }) {
  const totalAgents = status?.orchestrator?.totalAgents || 100;
  const active = status?.orchestrator?.activeTasks || 0;
  const completed = status?.orchestrator?.completedTasks || 0;

  return (
    <div style={{ background: '#080816', borderBottom: '1px solid #1a2040', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>K</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#c8d8f8', letterSpacing: '0.08em' }}>KRONOS AI v2.0</div>
          <div style={{ fontSize: 9, color: '#3a4060', letterSpacing: '0.12em' }}>100 AGENTS · CONTENT MACHINE · 7 PLATFORMS</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        <Stat label="AGENTS" value={totalAgents} color="#3b82f6" />
        <Stat label="ACTIVE" value={active} color="#10b981" />
        <Stat label="DONE" value={completed} color="#f59e0b" />
        <Stat label="STATUS" value={status ? '● ONLINE' : '○ ...'} color={status ? '#10b981' : '#4a5580'} />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: '#3a4060', letterSpacing: '0.12em' }}>{label}</div>
    </div>
  );
}

function ScheduleView({ schedule }) {
  if (!schedule?.length) return <Empty msg="No content scheduled yet — POST /api/content/campaign to start" />;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {schedule.map(item => (
        <div key={item.id} style={{ background: '#0d0d20', border: '1px solid #1a2040', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#c8d8f8' }}>{item.platform?.toUpperCase()} · {item.contentType}</span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontSize: 11, color: '#6070a0', marginBottom: 4 }}>{item.topic || item.hook}</div>
          <div style={{ fontSize: 9, color: '#3a4060' }}>{new Date(item.scheduledAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    scheduled: '#3b82f6',
    publishing: '#f59e0b',
    published: '#10b981',
    failed: '#ef4444',
    pending: '#6366f1',
  };
  const c = colors[status] || '#4a5580';
  return (
    <span style={{ fontSize: 9, background: c + '20', color: c, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', fontWeight: 600 }}>
      {status?.toUpperCase()}
    </span>
  );
}

function TaskFeed({ tasks, events }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 12, color: '#6070a0', margin: '0 0 12px' }}>RECENT TASKS</h3>
        {tasks.length === 0 && <Empty msg="No tasks yet" />}
        {tasks.map(t => (
          <div key={t.id} style={{ background: '#0d0d20', border: '1px solid #1a2040', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#8090c0', marginBottom: 3 }}>{t.input?.slice(0, 80)}</div>
            <div style={{ fontSize: 9, color: '#4a5580' }}>{t.durationMs}ms · {new Date(t.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: 12, color: '#6070a0', margin: '0 0 12px' }}>LIVE EVENTS</h3>
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {events.slice(0, 30).map((e, i) => (
            <div key={i} style={{ background: '#0a0a18', borderLeft: '2px solid #3b82f6', padding: '6px 12px', marginBottom: 4, fontSize: 10, color: '#6070a0' }}>
              <span style={{ color: '#a5b4fc' }}>{e.event}</span>
              <span style={{ marginLeft: 8 }}>{JSON.stringify(e.data).slice(0, 80)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#3a4060', fontSize: 11 }}>{msg}</div>
  );
}
