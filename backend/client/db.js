import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'client.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT DEFAULT 'idle',
  last_result TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  mode TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  started_at TEXT,
  finished_at TEXT,
  result_json TEXT,
  error_text TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_message_attachments (
  message_id INTEGER NOT NULL,
  attachment_id INTEGER NOT NULL,
  PRIMARY KEY (message_id, attachment_id),
  FOREIGN KEY(message_id) REFERENCES ai_messages(id),
  FOREIGN KEY(attachment_id) REFERENCES ai_attachments(id)
);

CREATE TABLE IF NOT EXISTS agent_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  action_type TEXT NOT NULL,
  action_payload_json TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  decided_at TEXT,
  expires_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  finished_at TEXT,
  result_json TEXT,
  error_text TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS verified_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hostname TEXT NOT NULL,
  token TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(user_id, hostname),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_oauth_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  sub TEXT NOT NULL,
  email TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(provider, sub),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_oauth_identities_user_id ON user_oauth_identities(user_id);
`);

// Lightweight migrations for existing local DB files
const tableColumns = (table) => {
  try {
    return db
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((c) => c.name);
  } catch {
    return [];
  }
};

const ensureColumn = (table, column, alterSql) => {
  const cols = tableColumns(table);
  if (!cols.includes(column)) {
    try {
      db.exec(alterSql);
    } catch {
      // ignore
    }
  }
};

ensureColumn('users', 'reset_token_hash', 'ALTER TABLE users ADD COLUMN reset_token_hash TEXT');
ensureColumn('users', 'reset_token_expires_at', 'ALTER TABLE users ADD COLUMN reset_token_expires_at TEXT');

// Email / phone verification (SQLite auth)
ensureColumn('users', 'first_name', 'ALTER TABLE users ADD COLUMN first_name TEXT');
ensureColumn('users', 'last_name', 'ALTER TABLE users ADD COLUMN last_name TEXT');
ensureColumn('users', 'phone', 'ALTER TABLE users ADD COLUMN phone TEXT');
ensureColumn('users', 'newsletter_opt_in', 'ALTER TABLE users ADD COLUMN newsletter_opt_in INTEGER NOT NULL DEFAULT 1');

ensureColumn('users', 'email_verified', 'ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
ensureColumn('users', 'email_verification_token_hash', 'ALTER TABLE users ADD COLUMN email_verification_token_hash TEXT');
ensureColumn('users', 'email_verification_expires_at', 'ALTER TABLE users ADD COLUMN email_verification_expires_at TEXT');

ensureColumn('users', 'phone_verified', 'ALTER TABLE users ADD COLUMN phone_verified INTEGER NOT NULL DEFAULT 0');
ensureColumn('users', 'phone_verification_code_hash', 'ALTER TABLE users ADD COLUMN phone_verification_code_hash TEXT');
ensureColumn('users', 'phone_verification_expires_at', 'ALTER TABLE users ADD COLUMN phone_verification_expires_at TEXT');

// SaaS subscription / entitlements (SQLite MVP)
// - plan: free/pro/enterprise
// - entitlements_json: server-controlled feature flags/quotas per user
//   (source of truth should be Stripe webhooks in production)
ensureColumn('users', 'plan', "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'");
ensureColumn('users', 'entitlements_json', 'ALTER TABLE users ADD COLUMN entitlements_json TEXT');

// AI conversation pinning
ensureColumn('ai_conversations', 'pinned', 'ALTER TABLE ai_conversations ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0');
ensureColumn('ai_conversations', 'pinned_at', 'ALTER TABLE ai_conversations ADD COLUMN pinned_at TEXT');

// AI-powered scan analysis (AppSec interpretation)
ensureColumn('audits', 'ai_analysis_json', 'ALTER TABLE audits ADD COLUMN ai_analysis_json TEXT');

export default db;
