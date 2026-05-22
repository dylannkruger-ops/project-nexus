import { useState, useEffect } from 'react';

const STAGE_META = {
  strategy:   { label: 'Strategy',    color: '#8b5cf6', icon: '🗺️' },
  image:      { label: 'Image gen',   color: '#3b82f6', icon: '🖼️' },
  video:      { label: 'Video gen',   color: '#ec4899', icon: '🎬' },
  critic:     { label: 'Review',      color: '#f59e0b', icon: '🔍' },
  scheduled:  { label: 'Scheduled',   color: '#06b6d4', icon: '📅' },
  published:  { label: 'Published',   color: '#22c55e', icon: '✅' },
  failed:     { label: 'Failed',      color: '#ef4444', icon: '❌' },
};

const PLATFORM_ICON = {
  tiktok:    '🎵',
  instagram: '📷',
  youtube:   '▶️',
  twitter:   '🐦',
  linkedin:  '💼',
  facebook:  '👥',
  pinterest: '📌',
};

export default function ContentFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, failed: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/content/recent?limit=30');
        const data = await r.json();
        setItems(data.items || []);
        const total = data.items?.length || 0;
        const published = data.items?.filter(i => i.status === 'published').length || 0;
        const failed = data.items?.filter(i => i.status === 'failed').length || 0;
        setStats({ total, published, failed, pending: total - published - failed });
      } catch (e) {
        console.error('content feed load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Content Pipeline</h2>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          Strategy → Image → Video → Critic → Schedule → Publish
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        marginBottom: 24,
      }}>
        {[
          { label: 'Total',     value: stats.total,     color: '#888' },
          { label: 'Published', value: stats.published, color: '#22c55e' },
          { label: 'Pending',   value: stats.pending,   color: '#f59e0b' },
          { label: 'Failed',    value: stats.failed,    color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#0f0f0f',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 14,
          }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color, marginTop: 4 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {loading && <div style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading content…</div>}

      {!loading && items.length === 0 && (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: '#666',
          background: '#0f0f0f',
          border: '1px dashed #2a2a2a',
          borderRadius: 8,
        }}>
          No content yet. POST to <code style={{ color: '#888' }}>/api/content/campaign</code> to kick off.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const stage = STAGE_META[item.status] || STAGE_META.strategy;
          return (
            <div key={item.id} style={{
              background: '#0f0f0f',
              border: '1px solid #2a2a2a',
              borderLeft: `3px solid ${stage.color}`,
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              gap: 14,
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 80,
                height: 80,
                background: '#1a1a1a',
                borderRadius: 6,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                overflow: 'hidden',
              }}>
                {item.image_url
                  ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (PLATFORM_ICON[item.platform] || '📦')}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.topic || item.id}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#888',
                      marginTop: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.hook || item.caption || '—'}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    background: `${stage.color}22`,
                    color: stage.color,
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.icon} {stage.label}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 14,
                  marginTop: 10,
                  fontSize: 11,
                  color: '#666',
                }}>
                  <span>{PLATFORM_ICON[item.platform]} {item.platform}</span>
                  {item.content_type && <span>· {item.content_type}</span>}
                  {item.scheduled_for && <span>· {new Date(item.scheduled_for).toLocaleString()}</span>}
                  {item.engagement_score != null && (
                    <span style={{ color: '#22c55e', marginLeft: 'auto' }}>
                      ⚡ {item.engagement_score.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
