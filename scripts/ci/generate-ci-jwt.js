#!/usr/bin/env node
/**
 * Generates a JWT compatible with JwtTokenProvider (JJWT HS256).
 * Requires JWT_SECRET env var. Prints token to stdout.
 */
const crypto = require('crypto');

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}

const userId = process.env.CI_USER_ID || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const email = process.env.CI_USER_EMAIL || 'ci.tester@nutritiontracker.local';
const role = process.env.CI_USER_ROLE || 'USER';
const expirationDays = Number(process.env.JWT_EXPIRATION_DAYS || 30);

const b64url = (value) => Buffer.from(value).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const exp = now + expirationDays * 24 * 60 * 60;

const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = b64url(
  JSON.stringify({ sub: userId, email, role, iat: now, exp })
);
const signature = crypto
  .createHmac('sha256', secret)
  .update(`${header}.${payload}`)
  .digest('base64url');

process.stdout.write(`${header}.${payload}.${signature}`);
