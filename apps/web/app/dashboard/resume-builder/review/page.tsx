'use client';

/**
 * ============================================================================
 * RESUME REVIEW ROUTE - DEPRECATED (Day 43)
 * ============================================================================
 *
 * DEPRECATED:
 * This route has been deprecated as of Day 43. Resume Review is now a MODE
 * inside the Resume Workspace, not a separate page.
 *
 * ============================================================================
 * DAY 43 UX RULES (AUTHORITATIVE - DO NOT VIOLATE)
 * ============================================================================
 *
 * 1. Resume Review is a MODE inside the Resume Workspace, not a separate page.
 * 2. Clicking "Review my resume" must NOT navigate away.
 * 3. The resume must remain visible and editable during review.
 * 4. PathAdvisor provides guidance while the user edits, not a read-only analysis.
 *
 * ============================================================================
 * BEHAVIOR
 * ============================================================================
 *
 * This route now redirects to /dashboard/resume-builder with a query param
 * that signals the Resume Builder to open the Resume Review modal.
 *
 * The actual Resume Review experience is handled by:
 * - components/resume-builder/resume-review-modal.tsx
 * - Opened via resumeReviewMode state in the Resume Builder page
 *
 * @deprecated Use ResumeReviewModal in Resume Builder instead
 * @version Day 43 - PathAdvisor Anchor & Focus Architecture
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Deprecated Resume Review Page.
 *
 * PURPOSE:
 * Redirects to Resume Builder with openReview=true query param.
 * The Resume Builder page will detect this param and open the Review modal.
 *
 * WHY THIS EXISTS (Day 43):
 * - Resume Review used to be a separate route (/dashboard/resume-builder/review)
 * - Day 43 changed it to be a modal mode within the Resume Builder
 * - This redirect ensures old links/bookmarks still work
 * - Users are seamlessly redirected to the new modal-based experience
 */
export default function DeprecatedResumeReviewPage() {
  const router = useRouter();

  useEffect(function redirectToResumeBuilder() {
    // Redirect to Resume Builder with openReview query param
    // The Resume Builder page will detect this and open the Review modal
    router.replace('/dashboard/resume-builder?openReview=true');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Redirecting to Resume Review...
        </p>
      </div>
    </div>
  );
}
