/**
 * Page Screenshot Generator
 *
 * Uses Puppeteer to capture full-page screenshots for the click heatmap.
 * Screenshots are stored as base64 in a SQLite table for quick access.
 */

import puppeteer from 'puppeteer';
import { db } from './db';

const VIEWPORT = { width: 1440, height: 900 };
const SCREENSHOT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Initialize the page_screenshots table */
export async function initScreenshotsTable() {
  if (!db) return;

  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS page_screenshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      screenshot_b64 TEXT NOT NULL,
      viewport_width INTEGER NOT NULL DEFAULT 1440,
      viewport_height INTEGER NOT NULL DEFAULT 900,
      page_height INTEGER NOT NULL DEFAULT 900,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    args: [],
  });
}

/** Capture a screenshot of a page by URL */
export async function capturePageScreenshot(
  siteUrl: string,
  slug: string,
): Promise<{ b64: string; pageHeight: number } | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Build full URL
    const url = slug === 'home'
      ? siteUrl
      : `${siteUrl.replace(/\/$/, '')}/${slug}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to render
    await new Promise(r => setTimeout(r, 2000));

    // Get full page height
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Take full-page screenshot as base64
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'jpeg',
      quality: 70,
    });

    const b64 = Buffer.from(screenshotBuffer).toString('base64');

    return { b64, pageHeight };
  } catch (err) {
    console.error('[Screenshots] Capture failed for', slug, err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

/** Save screenshot to database */
export async function saveScreenshot(
  slug: string,
  b64: string,
  pageHeight: number,
): Promise<void> {
  if (!db) return;

  await initScreenshotsTable();

  await db.execute({
    sql: `INSERT INTO page_screenshots (slug, screenshot_b64, viewport_width, viewport_height, page_height, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(slug) DO UPDATE SET
            screenshot_b64 = excluded.screenshot_b64,
            page_height = excluded.page_height,
            updated_at = datetime('now')`,
    args: [slug, b64, VIEWPORT.width, VIEWPORT.height, pageHeight],
  });
}

/** Get screenshot from database (returns null if expired or not found) */
export async function getScreenshot(slug: string): Promise<{
  b64: string;
  viewportWidth: number;
  viewportHeight: number;
  pageHeight: number;
  updatedAt: string;
} | null> {
  if (!db) return null;

  await initScreenshotsTable();

  const result = await db.execute({
    sql: `SELECT screenshot_b64, viewport_width, viewport_height, page_height, updated_at
          FROM page_screenshots WHERE slug = ?`,
    args: [slug],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const updatedAt = row.updated_at as string;

  // Check TTL
  const age = Date.now() - new Date(updatedAt).getTime();
  const isExpired = age > SCREENSHOT_TTL_MS;

  return {
    b64: row.screenshot_b64 as string,
    viewportWidth: row.viewport_width as number,
    viewportHeight: row.viewport_height as number,
    pageHeight: row.page_height as number,
    updatedAt,
  };
}

/** List all available screenshots */
export async function listScreenshots(): Promise<Array<{
  slug: string;
  updatedAt: string;
  pageHeight: number;
}>> {
  if (!db) return [];

  await initScreenshotsTable();

  const result = await db.execute({
    sql: `SELECT slug, updated_at, page_height FROM page_screenshots ORDER BY updated_at DESC`,
    args: [],
  });

  return result.rows.map(r => ({
    slug: r.slug as string,
    updatedAt: r.updated_at as string,
    pageHeight: r.page_height as number,
  }));
}
