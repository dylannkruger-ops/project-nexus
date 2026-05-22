import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PLATFORM_COLORS = {
  tiktok:    '#ec4899',
  instagram: '#8b5cf6',
  youtube:   '#ef4444',
  twitter:   '#3b82f6',
  linkedin:  '#06b6d4',
  facebook:  '#22c55e',
  pinterest: '#f59e0b',
};

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/metrics');
        const data = await r.json();
        setMetrics(data);
      } catch (e) {
        console.error('metrics load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#666' }}>Loading metrics…</div>;
  if (!metrics) return <div style={{ padding: 40, color: '#666' }}>No metrics available.</div>;

  const throughputData = metrics.throughput || [];
  const platformData = Object.entries(metrics.byPlatform || {}).map(([name, value]) => ({
    name,
    value,
    color: PLATFORM_COLORS[name] || '#888',
  }));
  const agentPerf = metrics.agentPerformance || [];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: 22 }}>Metrics</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Total tasks',     value: metrics.totalTasks || 0,        color: '#3b82f6' },
          { label: 'Posts published', value: metrics.totalPublished || 0,    color: '#22c55e' },
          { label: 'Avg score',       value: (metrics.avgScore || 0).toFixed(2), color: '#f59e0b' },
          { label: 'Success rate',    value: ((metrics.successRate || 0) * 100).toFixed(0) + '%', color: '#8b5cf6' },
          { label: 'Memory items',    value: metrics.memoryItems || 0,        color: '#ec4899' },
          { label: 'Queue depth',     value: metrics.queueDepth || 0,         color: '#06b6d4' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#0f0f0f',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 16,
          }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: stat.color, marginTop: 6 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          background: '#0f0f0f',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          padding: 16,
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#aaa' }}>
            Throughput (last 24h)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="hour" stroke="#666" style={{ fontSize: 11 }} />
              <YAxis stroke="#666" style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6 }}
                labelStyle={{ color: '#aaa' }}
              />
              <Line type="monotone" dataKey="tasks"  stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="posts"  stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: '#0f0f0f',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          padding: 16,
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#aaa' }}>
            Posts by platform
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={platformData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name }) => name}
                labelLine={false}
              >
                {platformData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        background: '#0f0f0f',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        padding: 16,
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#aaa' }}>
          Agent performance — average score by type
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={agentPerf}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="agentType" stroke="#666" style={{ fontSize: 11 }} />
            <YAxis stroke="#666" domain={[0, 1]} style={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6 }}
              labelStyle={{ color: '#aaa' }}
            />
            <Bar dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
