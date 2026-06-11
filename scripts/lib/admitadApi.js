/** Shared Admitad API helpers for scripts/. CJS, mirrors fetchAdmitadPrograms.js conventions. */
const path = require('path');

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const API_BASE = (process.env.ADMIT_API_BASE || 'https://api.admitad.com').replace(/\/$/, '');

function basicAuthHeader() {
  const id = process.env.ADMIT_CLIENT_ID;
  const secret = process.env.ADMIT_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('Missing ADMIT_CLIENT_ID / ADMIT_CLIENT_SECRET (set them in .env.local).');
  }
  return `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`;
}

async function fetchToken(scope) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.ADMIT_CLIENT_ID,
    scope,
  });
  const res = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Admitad token ${res.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  if (!data.access_token) throw new Error(`Token response missing access_token: ${text.slice(0, 300)}`);
  return data.access_token;
}

async function apiRequest(token, method, urlPath) {
  const res = await fetch(`${API_BASE}${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON body */ }
  return { ok: res.ok, status: res.status, data, text };
}

async function apiGet(token, urlPath) {
  const r = await apiRequest(token, 'GET', urlPath);
  if (!r.ok) throw new Error(`Admitad GET ${urlPath} ${r.status}: ${r.text.slice(0, 400)}`);
  return r.data;
}

/** GET all pages of a `{results, _meta}` endpoint. */
async function apiGetPaged(token, urlPath, searchParams = {}) {
  const limit = Number(process.env.ADMIT_PAGE_LIMIT) || 200;
  const all = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const params = new URLSearchParams({ ...searchParams, limit: String(limit), offset: String(offset) });
    const data = await apiGet(token, `${urlPath}?${params}`);
    const batch = Array.isArray(data?.results) ? data.results : [];
    total = typeof data?._meta?.count === 'number' ? data._meta.count : batch.length;
    all.push(...batch);
    if (batch.length === 0) break;
    offset += batch.length;
  }
  return all;
}

module.exports = { API_BASE, fetchToken, apiGet, apiGetPaged };
