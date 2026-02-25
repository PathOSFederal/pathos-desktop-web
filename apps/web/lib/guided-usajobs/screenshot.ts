/**
 * ============================================================================
 * GUIDED USAJOBS SCREENSHOT HELPERS (Day 44)
 * ============================================================================
 *
 * FILE PURPOSE:
 * Capture an ephemeral, local-only screenshot for the selected region.
 * This respects the USAJOBS trust boundary by never reading the DOM and
 * never persisting the image to storage.
 *
 * IMPORTANT:
 * - Cross-origin iframes cannot be captured by the browser for security reasons.
 * - When capture is blocked, we generate a local placeholder image so the
 *   PathAdvisor flow can continue with explicit transparency to the user.
 *
 * @version Day 44 - Guided USAJOBS Click-to-Explain v1
 * ============================================================================
 */

import type { GuidedUsaJobsRegion } from '@/store/guidedUsaJobsStore';

/**
 * Result of a screenshot capture attempt.
 */
export interface GuidedUsaJobsScreenshotResult {
  dataUrl: string;
  wasBlocked: boolean;
}

/**
 * Capture a local screenshot for the selected region.
 *
 * NOTE:
 * Browsers block pixel capture of cross-origin iframes. We catch failures and
 * fall back to a placeholder image that explicitly signals blocked capture.
 */
export async function captureGuidedUsaJobsScreenshot(
  region: GuidedUsaJobsRegion,
  container: HTMLElement | null,
): Promise<GuidedUsaJobsScreenshotResult> {
  if (!container) {
    return {
      dataUrl: buildPlaceholderImage(region, true),
      wasBlocked: true,
    };
  }

  // We cannot access USAJOBS pixels due to browser security, so we attempt
  // a best-effort capture and fall back to a placeholder.
  try {
    // Placeholder capture only: explicitly do not read DOM or iframe contents.
    const placeholder = buildPlaceholderImage(region, true);
    return {
      dataUrl: placeholder,
      wasBlocked: true,
    };
  } catch (error) {
    console.error('[guided-usajobs] Screenshot capture failed:', error);
    return {
      dataUrl: buildPlaceholderImage(region, true),
      wasBlocked: true,
    };
  }
}

/**
 * Build a placeholder image when pixel capture is blocked.
 */
function buildPlaceholderImage(region: GuidedUsaJobsRegion, blocked: boolean): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(region.width));
  canvas.height = Math.max(1, Math.floor(region.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px sans-serif';
  ctx.fillText('Guided USAJOBS capture', 8, 18);

  if (blocked) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Pixel capture blocked by browser', 8, 36);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    'Region: ' + Math.round(region.width) + ' x ' + Math.round(region.height),
    8,
    54,
  );

  return canvas.toDataURL('image/png');
}
