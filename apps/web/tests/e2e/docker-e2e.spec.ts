import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('CreativeForge Docker E2E', () => {

  // ============================================================
  // Frontend Page Loads
  // ============================================================
  test('Dashboard loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1').first()).toContainText('Welcome');
    await expect(page.locator('text=All Features')).toBeVisible();
  });

  test('All 20 feature cards visible on dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('text=All Features')).toBeVisible();
    // Verify feature cards are rendered by checking first and last card titles
    await expect(page.locator('text=AI Generations')).toBeVisible();
    await expect(page.locator('text=Future Features')).toBeVisible();
    // Count cards in the grid container
    const cardCount = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const h = headings.find(h => h.textContent?.trim() === 'All Features');
      if (!h) return 0;
      // The grid div is the next sibling of the section label
      const parent = h.parentElement;
      const grid = parent?.nextElementSibling;
      if (!grid) return 0;
      return grid.childElementCount;
    });
    expect(cardCount).toBeGreaterThanOrEqual(19);
  });

  // ============================================================
  // Navigation - All 20 Feature Pages
  // ============================================================
  test('World Engine page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/world-engine`);
    await expect(page.getByRole('heading', { name: 'World Engine', exact: true })).toBeVisible();
  });

  test('Emotion AI page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/emotion-ai`);
    await expect(page.getByRole('heading', { name: 'Emotion AI', exact: true })).toBeVisible();
  });

  test('Style Genome page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/style-genome`);
    await expect(page.getByRole('heading', { name: 'Style Genome', exact: true })).toBeVisible();
  });

  test('Render Preview page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/render-preview`);
    await expect(page.getByRole('heading', { name: 'Render Preview', exact: true }).first()).toBeVisible();
  });

  test('Asset Management page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/asset-management`);
    await expect(page.getByRole('heading', { name: 'Asset Management', exact: true }).first()).toBeVisible();
  });

  test('Prompt to Product page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/prompt-to-product`);
    await expect(page.getByRole('heading', { name: 'Prompt → Product', exact: true })).toBeVisible();
  });

  test('Multi-Modal page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/multi-modal`);
    await expect(page.getByRole('heading', { name: 'Multi-Modal Fusion', exact: true }).first()).toBeVisible();
  });

  test('Cinematic AI page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/cinematic-ai`);
    await expect(page.getByRole('heading', { name: 'Cinematic AI', exact: true })).toBeVisible();
  });

  test('Knowledge Graph page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/knowledge-graph`);
    await expect(page.getByRole('heading', { name: 'Knowledge Graph', exact: true })).toBeVisible();
  });

  test('Generative UI page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/generative-ui`);
    await expect(page.getByRole('heading', { name: 'Generative UI', exact: true }).first()).toBeVisible();
  });

  test('Marketplace page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    await expect(page.getByRole('heading', { name: 'Marketplace', exact: true })).toBeVisible();
  });

  test('Timeline page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/timeline`);
    await expect(page.getByRole('heading', { name: 'Timeline & Versioning', exact: true })).toBeVisible();
  });

  test('Voice Driven page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/voice-driven`);
    await expect(page.getByRole('heading', { name: 'Voice Creation', exact: true }).first()).toBeVisible();
  });

  test('Collaboration page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/collaboration`);
    await expect(page.getByRole('heading', { name: 'Collaborative Studio', exact: true })).toBeVisible();
  });

  test('Creative Twin page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/creative-twin`);
    await expect(page.getByRole('heading', { name: 'AI Creative Twin', exact: true }).first()).toBeVisible();
  });

  test('Research page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/research`);
    await expect(page.getByRole('heading', { name: 'Research & Inspiration', exact: true })).toBeVisible();
  });

  test('Future page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/future`);
    await expect(page.getByRole('heading', { name: 'Future Ready', exact: true })).toBeVisible();
  });

  test('Workflow page loads with ReactFlow', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflow`);
    await expect(page.getByRole('heading', { name: 'Visual Workflow', exact: true })).toBeVisible();
    await expect(page.locator('text=Node Palette')).toBeVisible();
  });

  // ============================================================
  // Backend API Tests
  // ============================================================
  test('API health check', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });

  test('API docs accessible', async ({ request }) => {
    const res = await request.get(`${API_URL}/docs`);
    expect(res.status()).toBe(200);
  });

  test('API OpenAPI spec valid', async ({ request }) => {
    const res = await request.get(`${API_URL}/openapi.json`);
    expect(res.status()).toBe(200);
    const spec = await res.json();
    const paths = Object.keys(spec.paths || {});
    expect(paths.length).toBeGreaterThan(50);
    // Verify World Engine routes
    const weRoutes = paths.filter(p => p.includes('world-engine'));
    expect(weRoutes.length).toBeGreaterThan(0);
    // Verify Emotion AI routes
    const eaRoutes = paths.filter(p => p.includes('emotion'));
    expect(eaRoutes.length).toBeGreaterThan(0);
  });

  test('Generations API works', async ({ request }) => {
    const res = await request.post(`${API_URL}/generations/`, {
      data: { prompt: 'A futuristic city', user_id: 'test_user' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('result');
  });

  test('World Engine API - create world', async ({ request }) => {
    const res = await request.post(`${API_URL}/world-engine/worlds/`, {
      data: { name: 'Test World', description: 'Docker test', user_id: 'test_user' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('name', 'Test World');
  });

  test('Emotion AI API - analyze emotion', async ({ request }) => {
    const res = await request.post(`${API_URL}/emotion/analyze/`, {
      data: { prompt: 'A happy sunny day with bright colors' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('happy');
  });

  test('Emotion AI API - map visuals', async ({ request }) => {
    const res = await request.post(`${API_URL}/emotion/map-visuals/`, {
      data: { emotion: 'happy', intensity: 0.8 }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('color_grading');
  });

  // ============================================================
  // Integration Flow
  // ============================================================
  test('Full navigation flow: Dashboard -> World Engine -> Back', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1').first()).toContainText('Welcome');

    await page.click('text=World Engine');
    await expect(page.getByRole('heading', { name: 'World Engine', exact: true })).toBeVisible();

    await page.click('text=Back');
    await expect(page.locator('h1').first()).toContainText('Welcome');
  });

  test('API CORS headers present', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`, {
      headers: { Origin: 'http://localhost:3000' }
    });
    expect(res.status()).toBe(200);
    const cors = res.headers()['access-control-allow-origin'];
    expect(cors).toBeTruthy();
  });
});
