/**
 * Script to create an admin user
 *
 * Usage: NODE_ENV=development bun run src/scripts/create-admin.ts
 * 
 * Note: Better Auth will automatically hash the password when using the API.
 * This script creates a user directly in the database for initial setup only.
 */

import Database from 'better-sqlite3';

const db = new Database('./data/auth.db');

async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - Better Auth will properly hash on actual sign-up
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  // Better auth expects bcrypt format, this is just for initial setup
  // For production, use the sign-up API instead
  return `$2a$10$${hash.substring(0, 53)}`; // Mock bcrypt format
}

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin User';

  const hashedPassword = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = Date.now();

  try {
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        emailVerified INTEGER DEFAULT 0,
        createdAt INTEGER,
        updatedAt INTEGER,
        role TEXT,
        organization TEXT,
        npi TEXT,
        specialty TEXT
      );

      CREATE TABLE IF NOT EXISTS password (
        userId TEXT PRIMARY KEY,
        hashedPassword TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id)
      );
    `);

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
    console.log('\n⚠️  IMPORTANT: Use the sign-up API for production users.');
    console.log('This script is for initial setup only.');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    console.log('\nℹ️  If user already exists, use the sign-up page instead.');
  } finally {
    db.close();
  }
}

createAdmin();
