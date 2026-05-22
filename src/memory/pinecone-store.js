import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config.js';

export class PineconeStore {
  constructor() {
    this.pc = new Pinecone({ apiKey: config.pinecone.apiKey });
    this.indexName = config.pinecone.indexName;
    this.index = null;
    this.dimension = 1536;
  }

  async init() {
    try {
      const existing = await this.pc.listIndexes();
      const names = existing.indexes?.map(i => i.name) || [];

      if (!names.includes(this.indexName)) {
        console.log(`[PINECONE] Creating index: ${this.indexName}`);
        await this.pc.createIndex({
          name: this.indexName,
          dimension: this.dimension,
          metric: 'cosine',
          spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
        });
        await new Promise(r => setTimeout(r, 30000));
      }

      this.index = this.pc.index(this.indexName);
      console.log(`[PINECONE] Index ready: ${this.indexName}`);
    } catch (err) {
      console.error('[PINECONE] Init failed:', err.message);
      throw err;
    }
  }

  // Simple deterministic embedding (replace with proper embeddings when available)
  // For production: use OpenAI text-embedding-3-small or similar
  simpleEmbed(text) {
    const vec = new Array(this.dimension).fill(0);
    const lower = text.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      const idx = (lower.charCodeAt(i) * 31 + i) % this.dimension;
      vec[idx] += 1;
    }
    // L2 normalize
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / mag);
  }

  async store(id, text, metadata = {}) {
    if (!this.index) await this.init();
    const values = this.simpleEmbed(text);
    await this.index.upsert([
      {
        id,
        values,
        metadata: {
          text: text.slice(0, 1000),
          timestamp: Date.now(),
          ...metadata,
        },
      },
    ]);
  }

  async search(query, topK = 10, filter = {}) {
    if (!this.index) await this.init();
    const queryVector = this.simpleEmbed(query);
    const res = await this.index.query({
      vector: queryVector,
      topK,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      includeMetadata: true,
    });
    return (
      res.matches?.map(m => ({
        id: m.id,
        score: m.score,
        ...m.metadata,
      })) || []
    );
  }

  async delete(id) {
    if (!this.index) await this.init();
    await this.index.deleteOne(id);
  }

  async deleteAll() {
    if (!this.index) await this.init();
    await this.index.deleteAll();
  }
}
