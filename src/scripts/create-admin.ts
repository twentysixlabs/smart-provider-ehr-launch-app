/**
 * Script to create an admin user
 *
 * Usage: bun run src/scripts/create-admin.ts
 */

import { createHash } from '@better-auth/utils/hash';
import Database from 'better-sqlite3';
import { env } from '@/env';

const db = new Database('./data/auth.db');

async function createAdmin() {
  const email = env.ADMIN_EMAIL || 'admin@example.com';
  const password = env.ADMIN_PASSWORD || 'admin123';
  const name = env.ADMIN_NAME || 'Admin User';

  const hashedPassword = await createHash('SHA-256').digest(password);
  const id = crypto.randomUUID();
  const now = Date.now();

  try {
    db.prepare(`
      INSERT INTO user (id, email, name, emailVerified, createdAt, updatedAt, role)
      VALUES (?, ?, ?, 1, ?, ?, 'admin')
    `).run(id, email, name, now, now);

    db.prepare(`
      INSERT INTO password (userId, hashedPassword)
      VALUES (?, ?)
    `).run(id, hashedPassword);

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nPlease change the password after first login.');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    db.close();
  }
}

createAdmin();
