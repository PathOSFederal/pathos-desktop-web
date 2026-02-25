/**
 * ============================================================================
 * JOB SEARCH PAGE
 * ============================================================================
 *
 * FILE PURPOSE:
 * Main job search interface for PathOS. Implements a guided workflow:
 * 1. Search and filter
 * 2. Scan ranked results
 * 3. Select a job
 * 4. Understand "why it matches"
 * 5. Take action (View details, Tailor resume, Save search, Alerts)
 *
 * WHERE IT FITS IN PATHOS ARCHITECTURE:
 * - Primary job discovery page under /dashboard/job-search
 * - Uses JobDetailsSlideOver for detailed job view
 * - Integrates with Resume Builder for tailoring
 * - Shows Career Outlook signals for selected jobs
 *
 * FEATURES:
 * - Results Header with count, sort, and active-filter chips
 * - Job result rows with decision signals (match %, pay, location, telework)
 * - Clear selection state with highlighted border
 * - Structured right panel with job summary, primary CTAs, and match accordion
 * - Job Alerts with actionable empty state (Day 19)
 * - Saved Jobs tab with search and clear-all (Day 19)
 * - Recommended roles based on user profile
 * - Mobile responsiveness (list first, details in drawer)
 *
 * @version Day 19 - Saved Jobs + Alerts
 * ============================================================================
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Maximize2,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Sparkles,
  X,
  Trash2,
  Bell,
  BellOff,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProfileStore } from '@/store/profileStore';
import { useUserPreferencesStore, useCardVisibility } from '@/store/userPreferencesStore';
import {
  useJobSearchStore,
  toLegacyJobFormat,
  type LegacyJobFormat,
  type JobCardModel,
} from '@/store/jobSearchStore';
import { useSavedJobsStore, type SavedJobSummary } from '@/store/savedJobsStore';
import { useJobAlertsStore, type JobAlert } from '@/store/jobAlertsStore';
import { useResumeBuilderStore } from '@/store/resumeBuilderStore';
import { handleHandoffOnLoad } from '@/lib/handoff/handoff';
import { useAdvisorContext } from '@/contexts/advisor-context';
import { usePathAdvisorInsights } from '@/hooks/use-pathadvisor-insights';
import type { PathScenario } from '@/types/pathadvisor';
import { askPathAdvisor } from '@/lib/pathadvisor/askPathAdvisor';
import { SensitiveValue } from '@/components/sensitive-value';
import { SeriesGuidePanel } from '@/components/dashboard/series-guide-panel';
import { JobAlertsWidget } from '@/components/dashboard/job-alerts-widget';
import { MoreFiltersPanel } from '@/components/dashboard/more-filters-panel';
import { JobDetailsSlideOver } from '@/components/dashboard/job-details-slideover';
import { JobSearchWorkspaceDialog } from '@/components/dashboard/job-search-workspace-dialog';
import { JobSearchResultsHeader } from '@/components/dashboard/job-search-results-header';
import { SelectedJobPanel } from '@/components/dashboard/selected-job-panel';
import { JobRecommendationCard } from '@/components/dashboard/job-recommendation-card';
import { PageShell } from '@/components/layout/page-shell';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

/**
 * DAY 12 NOTE:
 * This page still uses legacy field names (role, agency, grade, etc.) for now.
 * Jobs from the store are converted using toLegacyJobFormat() helper.
 * Future update: refactor to use canonical field names directly.
 */
type JobResult = LegacyJobFormat;

// Career Outlook is handled in SelectedJobPanel component

export default function JobSearchPage() {
  const router = useRouter();

  const user = useProfileStore(function (state) {
    return state.user;
  });

  const globalHide = useUserPreferencesStore(function (state) {
    return state.isSensitiveHidden;
  });

  const jobSearchFilters = useJobSearchStore(function (state) {
    return state.jobSearchFilters;
  });
  const setJobSearchFilters = useJobSearchStore(function (state) {
    return state.setJobSearchFilters;
  });
  const seriesGuideOpen = useJobSearchStore(function (state) {
    return state.seriesGuideOpen;
  });
  const setSeriesGuideOpen = useJobSearchStore(function (state) {
    return state.setSeriesGuideOpen;
  });
  const saveCurrentSearch = useJobSearchStore(function (state) {
    return state.saveCurrentSearch;
  });
  // Get canonical jobs from store
  const canonicalJobs = useJobSearchStore(function (state) {
    return state.jobs;
  });
  const recommendedRoles = useJobSearchStore(function (state) {
    return state.recommendedRoles;
  });

  /**
   * Convert canonical jobs to legacy format for backward compatibility (Day 12).
   * 
   * DAY 19 FIX:
   * Wrapped in useMemo to provide stable reference for sortedJobs dependency.
   * 
   * TODO: Refactor this page to use canonical field names directly.
   */
  const jobs: JobResult[] = useMemo(function convertToLegacyFormat() {
    const result: JobResult[] = [];
    for (let i = 0; i < canonicalJobs.length; i++) {
      result.push(toLegacyJobFormat(canonicalJobs[i]));
    }
    return result;
  }, [canonicalJobs]);

  const advisorContextData = useAdvisorContext();
  const setContext = advisorContextData.setContext;
  const setPendingPrompt = advisorContextData.setPendingPrompt;
  const setShouldOpenFocusMode = advisorContextData.setShouldOpenFocusMode;
  const setOnPathAdvisorClose = advisorContextData.setOnPathAdvisorClose;

  const startTailoredResumeSession = useResumeBuilderStore(function (state) {
    return state.startTailoredResumeSession;
  });
  const setCurrentStep = useResumeBuilderStore(function (state) {
    return state.setCurrentStep;
  });

  // Card visibility hooks
  const recommendationsVisibility = useCardVisibility('jobSearch.recommendations');

  // PathAdvisor insights hook
  const {
    insights: pathAdvisorInsights,
    isLoading: insightsLoading,
    fetchInsights,
  } = usePathAdvisorInsights();

  // ============================================================================
  // SAVED JOBS STORE
  // ============================================================================
  /**
   * Connect to the saved jobs store to:
   * 1. Display saved jobs in the "Saved" tab
   * 2. Load saved jobs from localStorage on mount
   * 3. Handle unsave actions
   * 4. Check if a job is saved (Day 19)
   * 5. Toggle save state (Day 19)
   * 6. Clear all saved jobs (Day 19)
   */
  const savedJobs = useSavedJobsStore(function (state) {
    return state.savedJobs;
  });
  const removeSavedJob = useSavedJobsStore(function (state) {
    return state.removeSaved;
  });
  const loadSavedJobsFromStorage = useSavedJobsStore(function (state) {
    return state.loadFromStorage;
  });
  const isSavedJobsLoaded = useSavedJobsStore(function (state) {
    return state.isLoaded;
  });
  const isSavedFn = useSavedJobsStore(function (state) {
    return state.isSaved;
  });
  const toggleSavedFn = useSavedJobsStore(function (state) {
    return state.toggleSaved;
  });
  const resetSavedJobs = useSavedJobsStore(function (state) {
    return state.resetSavedJobs;
  });

  // ============================================================================
  // JOB ALERTS STORE (Day 19)
  // ============================================================================
  const alerts = useJobAlertsStore(function (state) {
    return state.alerts;
  });
  const loadAlertsFromStorage = useJobAlertsStore(function (state) {
    return state.loadFromStorage;
  });
  const isAlertsLoaded = useJobAlertsStore(function (state) {
    return state.isLoaded;
  });
  const toggleAlert = useJobAlertsStore(function (state) {
    return state.toggleAlert;
  });
  const updateAlert = useJobAlertsStore(function (state) {
    return state.updateAlert;
  });
  const deleteAlert = useJobAlertsStore(function (state) {
    return state.deleteAlert;
  });
  const clearAlerts = useJobAlertsStore(function (state) {
    return state.clearAlerts;
  });
  const runAllAlerts = useJobAlertsStore(function (state) {
    return state.runAllAlerts;
  });

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  /**
   * selectedJob: Currently selected job for detail panel
   * - null when no job is selected (shows empty state)
   * - Set when user clicks a job row
   * - Day 35: Auto-selects first result when results exist (to avoid empty Selected Position panel)
   */
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);

  /**
   * sortBy: How to sort the job results
   * - 'match': Best match first (default)
   * - 'salary': Highest salary first
   * - 'date': Newest first
   */
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'date'>('match');

  /**
   * activeTab: Which tab is currently active
   * - 'results': Show search results (default)
   * - 'saved': Show saved jobs
   * - 'alerts': Show job alerts (Day 19)
   * 
   * DAY 15 SESSION 7 ADDITION:
   * Added tabs to provide a destination for saved jobs.
   * 
   * DAY 19 ADDITION:
   * Added alerts tab for job alerts management.
   */
  const [activeTab, setActiveTab] = useState<'results' | 'saved' | 'alerts'>('results');

  /**
   * focusedJobIndex: Index of the job currently focused via keyboard navigation.
   * - null when focus is not on job list
   * - Set by arrow key navigation
   * - Used to highlight and scroll to the focused job
   */
  const [focusedJobIndex, setFocusedJobIndex] = useState<number | null>(null);

  // UI state for modals and panels
  const [jobSearchWorkspaceOpen, setJobSearchWorkspaceOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  /**
   * Ref to the job list container for keyboard navigation.
   * Used to focus the list and handle arrow key events.
   */
  const jobListRef = useRef<HTMLDivElement>(null);

  const toastResult = useToast();
  const toast = toastResult.toast;

  // ============================================================================
  // DAY 19: Saved Jobs Search and Clear Confirmation
  // ============================================================================

  /**
   * savedJobsSearchQuery: Client-side search filter for saved jobs.
   * Filters the saved jobs list by title, organization, or grade.
   */
  const [savedJobsSearchQuery, setSavedJobsSearchQuery] = useState('');

  /**
   * showClearSavedJobsConfirm: Whether to show the confirmation dialog
   * for clearing all saved jobs.
   */
  const [showClearSavedJobsConfirm, setShowClearSavedJobsConfirm] = useState(false);

  /**
   * showClearAlertsConfirm: Whether to show the confirmation dialog
   * for clearing all alerts.
   */
  const [showClearAlertsConfirm, setShowClearAlertsConfirm] = useState(false);

  /**
   * editingAlert: The alert currently being edited, or null if not editing.
   */
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Sort jobs based on current sortBy state.
   * Creates a new array to avoid mutating the original.
   * 
   * DAY 19 FIX:
   * Wrapped in useMemo to provide a stable reference for useCallback dependencies.
   * The React Compiler requires memoized values to be stable for optimization.
   */
  const sortedJobs = useMemo(function sortJobsArray() {
    const sorted: JobResult[] = [];
    for (let i = 0; i < jobs.length; i++) {
      sorted.push(jobs[i]);
    }
    if (sortBy === 'match') {
      sorted.sort(function (a, b) {
        return b.matchPercent - a.matchPercent;
      });
    } else if (sortBy === 'salary') {
      sorted.sort(function (a, b) {
        return b.estTotalComp - a.estTotalComp;
      });
    }
    // 'date' sorting would require a date field; for now keep original order
    return sorted;
  }, [jobs, sortBy]);

  // ============================================================================
  // RECOMMENDATION GATING LOGIC (Day 33 - De-duplicate recommendation surfaces)
  // ============================================================================
  /**
   * GATING RULES:
   * - PathAdvisor Recommendation card: Show ONLY when a job is selected (job-specific guidance)
   * - Recommended roles based on your profile: Show ONLY when no job is selected (exploration fallback)
   * - They must not stack
   * 
   * HOW IT WORKS:
   * 1. Check if selectedJob is not null AND exists in sortedJobs (hasSelectedJob)
   * 2. Check if there are any results (hasResults)
   * 3. PathAdvisor card renders only when hasSelectedJob is true
   * 4. Profile-based card renders only when hasSelectedJob is false AND hasResults is true
   */

  /**
   * hasSelectedJob: True when a job is selected AND that job exists in the current results.
   * Used to determine which recommendation card to show.
   */
  const hasSelectedJob = useMemo(function computeHasSelectedJob() {
    if (selectedJob === null) {
      return false;
    }
    // Check if selected job exists in sorted results
    for (let i = 0; i < sortedJobs.length; i++) {
      if (sortedJobs[i].id === selectedJob.id) {
        return true;
      }
    }
    return false;
  }, [selectedJob, sortedJobs]);

  /**
   * hasResults: True when there are any job results available.
   * Used to determine if profile-based recommendations should be shown.
   */
  const hasResults = sortedJobs.length > 0;

  // ============================================================================
  // KEYBOARD NAVIGATION HANDLER
  // ============================================================================
  /**
   * handleJobListKeyDown: Handles arrow key navigation in the job list.
   *
   * HOW IT WORKS:
   * - ArrowDown: Move focus to next job (or first if none focused)
   * - ArrowUp: Move focus to previous job (or last if none focused)
   * - Enter: Select the currently focused job
   * - Escape: Clear focus
   *
   * ACCESSIBILITY:
   * - Job list has role="listbox" and tabIndex={0} for keyboard focus
   * - Each job row has role="option" and aria-selected based on selection
   * - Focus ring is visible on the focused job
   *
   * @param event - Keyboard event from the job list container
   */
  const handleJobListKeyDown = useCallback(
    function (event: React.KeyboardEvent<HTMLDivElement>) {
      const jobCount = sortedJobs.length;
      if (jobCount === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedJobIndex(function (prev) {
          if (prev === null) return 0;
          return prev < jobCount - 1 ? prev + 1 : prev;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedJobIndex(function (prev) {
          if (prev === null) return jobCount - 1;
          return prev > 0 ? prev - 1 : prev;
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedJobIndex !== null && sortedJobs[focusedJobIndex]) {
          setSelectedJob(sortedJobs[focusedJobIndex]);
          // On mobile, open the details slide-over
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setJobDetailsOpen(true);
          }
        }
      } else if (event.key === 'Escape') {
        setFocusedJobIndex(null);
      }
    },
    [sortedJobs, focusedJobIndex]
  );

  /**
   * Effect: Scroll focused job into view.
   * Ensures the keyboard-focused job is always visible in the list.
   */
  useEffect(
    function () {
      if (focusedJobIndex !== null && jobListRef.current) {
        const focusedElement = jobListRef.current.querySelector(
          '[data-job-index="' + focusedJobIndex + '"]'
        );
        if (focusedElement) {
          focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    },
    [focusedJobIndex]
  );

  useEffect(function () {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // ============================================================================
  // DAY 35: GUIDED HANDOFF HANDLER
  // ============================================================================
  /**
   * Effect: Handle handoff on page load.
   * When PathAdvisor navigates with ?handoff=<id>, this scrolls to and
   * highlights the target section, then clears the query param.
   */
  useEffect(
    function handleHandoff() {
      handleHandoffOnLoad(router);
    },
    [router]
  );

  // ============================================================================
  // DAY 35: AUTO-SELECT FIRST JOB
  // ============================================================================
  /**
   * Effect: Auto-select first job when results exist and no job is selected.
   * 
   * HOW IT WORKS:
   * 1. When sortedJobs changes (results loaded or sorted)
   * 2. If results exist AND (selectedJob is null OR selectedJob not found in results)
   * 3. Set selectedJob to first result (sortedJobs[0])
   * 4. If results empty, keep selectedJob as null (shows empty state)
   * 
   * WHY THIS EXISTS:
   * Day 35 requirement: Selected Position should never be empty when results exist.
   * Auto-selecting the first result provides immediate context without requiring
   * user to click a job row first.
   * 
   * NOTE: Uses requestAnimationFrame to defer setState and avoid lint error.
   */
  useEffect(
    function autoSelectFirstJob() {
      // Only auto-select if we're on the results tab
      if (activeTab !== 'results') {
        return;
      }

      // Defer state updates to avoid setState in effect
      requestAnimationFrame(function () {
        // If results exist
        if (sortedJobs.length > 0) {
          // If no job selected, or selected job not found in current results
          if (selectedJob === null) {
            // Auto-select first result
            setSelectedJob(sortedJobs[0]);
          } else {
            // Check if selected job still exists in results
            let found = false;
            for (let i = 0; i < sortedJobs.length; i++) {
              if (sortedJobs[i].id === selectedJob.id) {
                found = true;
                break;
              }
            }
            // If selected job not found, reset to first result
            if (!found) {
              setSelectedJob(sortedJobs[0]);
            }
          }
        } else {
          // If results empty, clear selection (shows empty state)
          if (selectedJob !== null) {
            setSelectedJob(null);
          }
        }
      });
    },
    [sortedJobs, activeTab, selectedJob]
  );

  // ============================================================================
  // LOAD SAVED JOBS FROM STORAGE
  // ============================================================================
  /**
   * Effect: Load saved jobs from localStorage on mount.
   * This ensures the saved jobs tab shows the correct data.
   */
  useEffect(function loadSavedJobsOnMount() {
    if (!isSavedJobsLoaded) {
      loadSavedJobsFromStorage();
    }
  }, [isSavedJobsLoaded, loadSavedJobsFromStorage]);

  /**
   * Effect: Load alerts from localStorage on mount.
   * Also runs all alerts against current jobs to get match counts.
   * 
   * DAY 19 ADDITION.
   */
  useEffect(function loadAlertsOnMount() {
    if (!isAlertsLoaded) {
      loadAlertsFromStorage();
    }
  }, [isAlertsLoaded, loadAlertsFromStorage]);

  /**
   * buildMatchableJobs: Converts canonical jobs to the format expected by runAllAlerts.
   * 
   * WHY THIS EXISTS:
   * The jobAlertsStore.runAllAlerts() expects a specific shape for job matching.
   * This helper extracts and normalizes the fields needed for alert matching.
   * Used both in the effect and after manual alert edits to keep counts fresh.
   * 
   * DAY 19 FIX:
   * Wrapped in useCallback with empty dependency array since this is a pure
   * transformation function with no external dependencies. This satisfies
   * the exhaustive-deps rule when used in useEffect dependency arrays.
   */
  const buildMatchableJobs = useCallback(function (jobsToConvert: JobCardModel[]) {
    const result: Array<{
      id: string;
      title: string;
      summary: string;
      seriesCode: string;
      gradeLevel: string;
      locationDisplay: string;
      teleworkEligibility: string;
    }> = [];
    for (let i = 0; i < jobsToConvert.length; i++) {
      const job = jobsToConvert[i];
      result.push({
        id: job.id,
        title: job.title,
        summary: '', // Not available in JobCardModel
        seriesCode: job.seriesCode || '',
        gradeLevel: job.gradeLevel || '',
        locationDisplay: job.locationDisplay || '',
        teleworkEligibility: '', // Not directly available
      });
    }
    return result;
  }, []);

  /**
   * alertsCount: Number of alerts currently loaded.
   * Computed outside the effect to be a stable primitive value for dependencies.
   * 
   * DAY 19 FIX:
   * Using a primitive (number) instead of alerts.length inside the effect
   * ensures the dependency array contains only stable values that can be
   * compared by value rather than reference.
   */
  const alertsCount = alerts.length;

  /**
   * Effect: Run alerts against current jobs when jobs change.
   * This updates the match counts for all enabled alerts.
   * 
   * DAY 19 FIX:
   * - Replaced eslint-disable with proper dependency handling
   * - alertsCount is computed outside as a stable primitive
   * - runAllAlerts is a stable function from the store
   * - buildMatchableJobs is now a useCallback with stable reference
   */
  useEffect(function runAlertsOnJobsChange() {
    if (isAlertsLoaded && alertsCount > 0 && canonicalJobs.length > 0) {
      const matchableJobs = buildMatchableJobs(canonicalJobs);
      runAllAlerts(matchableJobs);
    }
  }, [isAlertsLoaded, alertsCount, canonicalJobs, runAllAlerts, buildMatchableJobs]);

  // ============================================================================
  // PATHADVISOR INSIGHTS EFFECT (Day 19 Fix, Day 20 Refinement)
  // ============================================================================
  /**
   * Fetch PathAdvisor insights when a job is selected.
   * Re-runs when job changes OR when user's employment status changes
   * to ensure scenarioType is correct for the insights API.
   * 
   * DAY 19 FIX:
   * - Replaced `selectedJob?.id` with explicit null check to comply with
   *   house rules (no optional chaining operators)
   * - Computed selectedJobId and scenarioType OUTSIDE the effect as stable
   *   primitive values for the dependency array
   * - All values used inside the effect are now in the dependency array
   * 
   * DAY 20 REFINEMENT:
   * - Wrapped scenarioType derivation in useMemo for explicit dependency chain
   * - Inputs to useMemo are stable primitives (selectedJobId, isCurrentEmployee)
   * - Effect dependencies only include stable primitives and memoized values
   * 
   * DEPENDENCIES:
   * - selectedJobId: re-fetch when a different job is selected
   * - scenarioType: re-fetch when employment status changes (memoized)
   * - fetchInsights: stable function from hook (wrapped in useCallback)
   * - selectedJob: the full job object for building the scenario
   */
  const selectedJobId = selectedJob !== null ? String(selectedJob.id) : null;
  const isCurrentEmployee = user.currentEmployee === true;
  
  /**
   * Memoized scenarioType derivation.
   * WHY USEMEMO: Makes the dependency chain explicit - scenarioType only changes
   * when isCurrentEmployee changes. This prevents stale data detection issues
   * and makes lint warnings impossible.
   */
  const scenarioType = useMemo(function deriveScenarioType() {
    return isCurrentEmployee ? 'promotion' : 'entry';
  }, [isCurrentEmployee]);
  
  useEffect(
    function fetchInsightsOnJobChange() {
      if (selectedJob !== null) {
        const scenario: PathScenario = {
          targetGradeBand: selectedJob.grade,
          targetLocation: selectedJob.location,
          jobId: String(selectedJob.id),
          jobSeries: selectedJob.series,
          jobTitle: selectedJob.role,
          scenarioType: scenarioType,
        };
        fetchInsights(scenario);
      }
    },
    [selectedJobId, scenarioType, fetchInsights, selectedJob]
  );

  // Note: Career Outlook computation is handled in SelectedJobPanel

  const handleUseMyProfile = function () {
    if (user.currentEmployee) {
      setJobSearchFilters({
        location: 'dc',
        gradeBand: 'gs13',
        agency: 'dod',
      });
    } else {
      setJobSearchFilters({
        location: 'dc',
        gradeBand: 'gs12',
      });
    }
  };

  const handleSaveDefaultSearch = function () {
    const newSearch = saveCurrentSearch();
    if (!newSearch) return;

    setJustSaved(true);
    setTimeout(function () {
      setJustSaved(false);
    }, 1500);

    /**
     * DAY 15 SESSION 9: Updated scroll target from "saved-searches-section"
     * to "saved-searches" to match the renamed anchor in job-alerts-widget.
     */
    toast({
      title: 'Search saved',
      description: newSearch.name,
      action: (
        <ToastAction
          altText="View saved search"
          onClick={function () {
            const el = document.getElementById('saved-searches');
            if (el !== null && el !== undefined) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          View
        </ToastAction>
      ),
    });
  };

  const handleTailorResume = function () {
    if (!selectedJob) {
      return;
    }

    let employeeOptions = undefined;
    if (user.currentEmployee) {
      const gradeStep = user.gradeStep;
      let currentGrade = 'GS-13';
      if (gradeStep) {
        const parts = gradeStep.split('-');
        if (parts.length > 0) {
          currentGrade = parts[0];
        }
      }
      employeeOptions = {
        isEmployee: true,
        currentGrade: currentGrade,
        currentSeries: '0343',
        currentAgency: user.agency || 'DoD',
      };
    }

    const targetJob = startTailoredResumeSession(
      {
        id: String(selectedJob.id),
        role: selectedJob.role,
        series: selectedJob.series,
        grade: selectedJob.grade,
        agency: selectedJob.agency,
        location: selectedJob.location,
        matchPercent: selectedJob.matchPercent,
      },
      employeeOptions,
    );

    // Set default step to Work Experience (index 2) for tailoring
    setCurrentStep(2);

    if (targetJob) {
      let targetJobId = String(selectedJob.id);
      if (targetJob.jobId) {
        targetJobId = String(targetJob.jobId);
      }

      const url =
        '/dashboard/resume-builder?targetJobId=' +
        encodeURIComponent(targetJobId) +
        '&mode=tailor';

      router.push(url);
    }
  };

  // Day 43: Updated to use askPathAdvisor (anchor-first, always opens Focus Mode)
  const handleGetApplicationTips = function () {
    if (!selectedJob) return;

    // Build job label for anchor
    const jobLabel = selectedJob.role + ', ' + selectedJob.series + ' ' + selectedJob.grade;
    const prompt =
      "I'm considering this position: " +
      selectedJob.role +
      ', ' +
      selectedJob.series +
      ' ' +
      selectedJob.grade +
      ', ' +
      selectedJob.agency +
      ', ' +
      selectedJob.location +
      '. Based on my profile and your match analysis' +
      (selectedJob.matchPercent ? ' (' + selectedJob.matchPercent + '% match)' : '') +
      ", what are your top tips for my application? What should I emphasize in my resume and KSAs, and are there any risks or gaps I should address?";

    // Day 43: Use askPathAdvisor (anchor-first, always opens Focus Mode)
    askPathAdvisor({
      source: 'job',
      sourceId: String(selectedJob.id),
      sourceLabel: jobLabel,
      summary: 'Considering this position',
      contextPayload: {
        source: 'job-details',
        prompt: prompt,
        jobTitle: selectedJob.role,
        jobSeries: selectedJob.series,
        jobGrade: selectedJob.grade,
        jobAgency: selectedJob.agency,
        jobLocation: selectedJob.location,
      },
      contextFunctions: {
        setContext: setContext,
        setPendingPrompt: setPendingPrompt,
        setShouldOpenFocusMode: setShouldOpenFocusMode,
        setOnPathAdvisorClose: setOnPathAdvisorClose,
      },
    });
  };

  // NOTE: handleSaveJob was removed because it's now handled internally
  // by SelectedJobPanel using useSavedJobsStore. This provides better
  // UX with toggle behavior and visual feedback.

  /**
   * handleUnsaveJob: Removes a job from the saved jobs list.
   * Called from the Saved tab when user clicks "Unsave".
   * 
   * DAY 15 SESSION 7 ADDITION.
   */
  const handleUnsaveJob = function (jobId: string, jobTitle: string) {
    removeSavedJob(jobId);
    toast({
      title: 'Removed from saved',
      description: jobTitle,
    });
  };

  // ============================================================================
  // DAY 19: Save Job From Card Handler
  // ============================================================================
  /**
   * handleSaveJobFromCard: Toggles the saved state of a job from the job card.
   * Stops propagation to prevent selecting the job when clicking save.
   * 
   * @param job - The job to save/unsave (legacy format)
   * @param event - The click event (to stop propagation)
   */
  const handleSaveJobFromCard = function (job: JobResult, event: React.MouseEvent) {
    // Stop propagation to prevent selecting the job
    event.stopPropagation();

    const savedJobData = {
      id: String(job.id),
      title: job.role,
      organizationName: job.agency,
      locationDisplay: job.location,
      gradeLevel: job.grade,
      seriesCode: job.series,
      matchPercent: job.matchPercent,
      estimatedTotalComp: job.estTotalComp,
    };

    const result = toggleSavedFn(savedJobData);

    if (result === 'saved') {
      toast({
        title: 'Saved job',
        description: job.role + ' at ' + job.agency,
      });
    } else {
      toast({
        title: 'Removed from saved',
        description: job.role + ' at ' + job.agency,
      });
    }
  };

  // ============================================================================
  // DAY 19: Clear All Saved Jobs Handler
  // ============================================================================
  /**
   * handleClearAllSavedJobs: Clears all saved jobs after confirmation.
   */
  const handleClearAllSavedJobs = function () {
    resetSavedJobs();
    setShowClearSavedJobsConfirm(false);
    toast({
      title: 'Saved jobs cleared',
      description: 'All saved jobs have been removed.',
    });
  };

  // ============================================================================
  // DAY 19: Alert Management Handlers
  // ============================================================================

  /**
   * handleToggleAlert: Toggles an alert's enabled state.
   * Also reruns all alerts to refresh match counts immediately.
   */
  const handleToggleAlert = function (alertId: string) {
    const newState = toggleAlert(alertId);
    if (newState !== null) {
      toast({
        title: newState ? 'Alert enabled' : 'Alert disabled',
        description: newState ? 'Tracking similar jobs in your Alerts tab.' : 'Alert is now paused.',
      });
      // Rerun alerts to update match counts after enable/disable toggle
      if (canonicalJobs.length > 0) {
        runAllAlerts(buildMatchableJobs(canonicalJobs));
      }
    }
  };

  /**
   * handleUpdateAlertFrequency: Updates an alert's frequency.
   * Also reruns all alerts to refresh match counts immediately.
   */
  const handleUpdateAlertFrequency = function (alertId: string, frequency: 'daily' | 'weekly') {
    updateAlert(alertId, { frequency: frequency });
    toast({
      title: 'Alert updated',
      description: 'Alert frequency changed to ' + frequency + '.',
    });
    // Rerun alerts to update match counts after frequency change
    if (canonicalJobs.length > 0) {
      runAllAlerts(buildMatchableJobs(canonicalJobs));
    }
  };

  /**
   * handleDeleteAlert: Deletes an alert after confirmation.
   */
  const handleDeleteAlert = function (alertId: string, alertName: string) {
    deleteAlert(alertId);
    toast({
      title: 'Alert deleted',
      description: '"' + alertName + '" has been removed.',
    });
  };

  /**
   * handleClearAllAlerts: Clears all alerts after confirmation.
   */
  const handleClearAllAlerts = function () {
    clearAlerts();
    setShowClearAlertsConfirm(false);
    toast({
      title: 'All alerts cleared',
      description: 'All job alerts have been removed.',
    });
  };

  /**
   * handleSaveEditedAlert: Saves changes to an edited alert.
   * Also reruns all alerts to refresh match counts immediately.
   */
  const handleSaveEditedAlert = function () {
    if (!editingAlert) return;

    updateAlert(editingAlert.id, {
      name: editingAlert.name,
      keywords: editingAlert.keywords,
      series: editingAlert.series,
      gradeBand: editingAlert.gradeBand,
      location: editingAlert.location,
      remoteOnly: editingAlert.remoteOnly,
      frequency: editingAlert.frequency,
    });

    toast({
      title: 'Alert updated',
      description: '"' + editingAlert.name + '" has been saved.',
    });

    setEditingAlert(null);

    // Rerun alerts to update match counts after editing
    if (canonicalJobs.length > 0) {
      runAllAlerts(buildMatchableJobs(canonicalJobs));
    }
  };

  /**
   * handleViewSavedJobDetails: Opens details for a saved job.
   * Converts SavedJobSummary to LegacyJobFormat for detail view.
   * 
   * DAY 15 SESSION 7 ADDITION.
   */
  const handleViewSavedJobDetails = function (savedJob: SavedJobSummary) {
    // Convert SavedJobSummary to LegacyJobFormat for compatibility
    const legacyJob: JobResult = {
      id: parseInt(savedJob.id, 10) || 0,
      role: savedJob.title,
      series: savedJob.seriesCode,
      grade: savedJob.gradeLevel,
      location: savedJob.locationDisplay,
      agency: savedJob.organizationName,
      type: 'Permanent', // Default since not stored in SavedJobSummary
      estTotalComp: savedJob.estimatedTotalComp,
      retirementImpact: 'No change', // Default since not stored
      matchPercent: savedJob.matchPercent,
    };

    setSelectedJob(legacyJob);

    // On mobile, open the details slide-over
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setJobDetailsOpen(true);
    }
  };

  /**
   * handleTailorSavedJob: Tailors resume for a saved job.
   * Similar to handleTailorResume but works directly with SavedJobSummary.
   * 
   * DAY 15 FIX: Added to enable Tailor action from Saved Jobs tab.
   * The regular handleTailorResume relies on selectedJob state which
   * may not be set when clicking Tailor directly on a saved job row.
   */
  const handleTailorSavedJob = function (savedJob: SavedJobSummary) {
    let employeeOptions = undefined;
    if (user.currentEmployee) {
      const gradeStep = user.gradeStep;
      let currentGrade = 'GS-13';
      if (gradeStep) {
        const parts = gradeStep.split('-');
        if (parts.length > 0) {
          currentGrade = parts[0];
        }
      }
      employeeOptions = {
        isEmployee: true,
        currentGrade: currentGrade,
        currentSeries: '0343',
        currentAgency: user.agency || 'DoD',
      };
    }

    const targetJob = startTailoredResumeSession(
      {
        id: savedJob.id,
        role: savedJob.title,
        series: savedJob.seriesCode,
        grade: savedJob.gradeLevel,
        agency: savedJob.organizationName,
        location: savedJob.locationDisplay,
        matchPercent: savedJob.matchPercent,
      },
      employeeOptions,
    );

    // Set default step to Work Experience (index 2) for tailoring
    setCurrentStep(2);

    if (targetJob) {
      let targetJobId = savedJob.id;
      if (targetJob.jobId) {
        targetJobId = String(targetJob.jobId);
      }

      const url =
        '/dashboard/resume-builder?targetJobId=' +
        encodeURIComponent(targetJobId) +
        '&mode=tailor';

      router.push(url);
    }
  };

  return (
    <PageShell fullWidth>
      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Job Search</h1>
          <p className="text-sm text-muted-foreground">
            {user.currentEmployee
              ? 'Search openings and compare how a new role impacts pay, benefits, and retirement.'
              : 'Find your first federal role and see how it matches your skills and goals.'}
          </p>
        </div>

        {/* Job Search Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4">
          {/* Job Search Card - full width on mobile, 60% on desktop */}
          <Card className="lg:col-span-3 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Job Search</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={function () {
                    setJobSearchWorkspaceOpen(true);
                  }}
                  aria-label="Open job search workspace"
                  className="flex-shrink-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ================================================================
                  SEARCH INPUT WITH CLEAR BUTTON
                  Provides inline clear button for quick reset of search text.
                  ================================================================ */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job titles, series, or keywords..."
                    className="pl-10 pr-10 h-10 bg-background"
                    value={jobSearchFilters.query}
                    onChange={function (e) {
                      setJobSearchFilters({ query: e.target.value });
                    }}
                    aria-label="Search jobs"
                  />
                  {/* Inline clear button - only shows when query has text */}
                  {jobSearchFilters.query && jobSearchFilters.query.length > 0 && (
                    <button
                      type="button"
                      onClick={function () {
                        setJobSearchFilters({ query: '' });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Job Type Segmented Control */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {['Federal', 'Military', 'Civilian'].map(function (type) {
                      const isActive = jobSearchFilters.segment === type.toLowerCase();
                      return (
                        <button
                          key={type}
                          onClick={function () {
                            setJobSearchFilters({
                              segment: type.toLowerCase() as 'federal' | 'military' | 'civilian',
                            });
                          }}
                          className={
                            'px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ' +
                            (isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-card text-muted-foreground hover:bg-muted')
                          }
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={handleUseMyProfile}
                    >
                      Use my profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={handleSaveDefaultSearch}
                      disabled={justSaved}
                      data-handoff-target="save-search"
                    >
                      {justSaved ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                          Save this search
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Filter Strip */}
                <div
                  className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible"
                  data-handoff-target="set-target"
                >
                  <Select
                    value={jobSearchFilters.location || ''}
                    onValueChange={function (value) {
                      setJobSearchFilters({ location: value || null });
                    }}
                  >
                    <SelectTrigger className="w-[120px] lg:w-[140px] h-8 text-xs flex-shrink-0">
                      <MapPin className="w-3 h-3 mr-1" />
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dc">Washington, DC</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                      <SelectItem value="co">Colorado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={jobSearchFilters.gradeBand || ''}
                    onValueChange={function (value) {
                      setJobSearchFilters({ gradeBand: value || null });
                    }}
                  >
                    <SelectTrigger className="w-[100px] lg:w-[140px] h-8 text-xs flex-shrink-0">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gs12">GS-12</SelectItem>
                      <SelectItem value="gs13">GS-13</SelectItem>
                      <SelectItem value="gs14">GS-14</SelectItem>
                      <SelectItem value="gs15">GS-15</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs px-2 gap-1 flex-shrink-0 hidden sm:flex"
                    onClick={function () {
                      setSeriesGuideOpen(true);
                    }}
                  >
                    <BookOpen className="w-3 h-3" />
                    Series guide
                  </Button>
                  <Select
                    value={jobSearchFilters.agency || ''}
                    onValueChange={function (value) {
                      setJobSearchFilters({ agency: value || null });
                    }}
                  >
                    <SelectTrigger className="w-[100px] lg:w-[140px] h-8 text-xs flex-shrink-0">
                      <Building2 className="w-3 h-3 mr-1" />
                      <SelectValue placeholder="Agency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dod">DoD</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="usda">USDA</SelectItem>
                      <SelectItem value="dhs">DHS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 bg-transparent flex-shrink-0"
                    onClick={function () {
                      setMoreFiltersOpen(true);
                    }}
                  >
                    <Filter className="w-3 h-3" />
                    <span className="hidden sm:inline">More filters</span>
                    <span className="sm:hidden">Filters</span>
                  </Button>
                </div>
              </div>

              {/* ================================================================
                  RESULTS / SAVED / ALERTS TOGGLE TABS (Day 19)
                  ================================================================
                  
                  PURPOSE:
                  Provides destinations for search results, saved jobs, and alerts.
                  
                  TABS:
                  - Results: Shows search results (default)
                  - Saved: Shows saved jobs with count badge
                  - Alerts: Shows job alerts with count badge (Day 19)
                  ================================================================ */}
              <div className="flex items-center gap-1 border-b border-border">
                <button
                  type="button"
                  onClick={function () {
                    setActiveTab('results');
                  }}
                  className={
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ' +
                    (activeTab === 'results'
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted')
                  }
                >
                  Results
                </button>
                <button
                  type="button"
                  onClick={function () {
                    setActiveTab('saved');
                  }}
                  className={
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ' +
                    (activeTab === 'saved'
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted')
                  }
                >
                  Saved
                  {savedJobs.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent/20 text-xs font-medium">
                      {savedJobs.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={function () {
                    setActiveTab('alerts');
                  }}
                  className={
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ' +
                    (activeTab === 'alerts'
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted')
                  }
                >
                  <Bell className="w-3.5 h-3.5" />
                  Alerts
                  {alerts.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent/20 text-xs font-medium">
                      {alerts.length}
                    </span>
                  )}
                </button>
              </div>

              {/* ================================================================
                  RESULTS TAB CONTENT
                  ================================================================ */}
              {activeTab === 'results' && (
                <>
              {/* ================================================================
                  RESULTS HEADER
                  Shows result count, sort control, and active filter chips.
                  ================================================================ */}
              <JobSearchResultsHeader
                resultCount={sortedJobs.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* ================================================================
                  JOB RESULTS LIST
                  Enhanced job rows with better decision signals:
                  - Title, agency on one line
                  - Grade, location, remote/telework badge
                  - Pay range
                  - Close date (mock)
                  - One compact match indicator
                  - Clear selection state with border
                  - KEYBOARD NAVIGATION: Use arrow keys to navigate
                  ================================================================ */}
              <div
                ref={jobListRef}
                className="border border-border rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                role="listbox"
                tabIndex={0}
                onKeyDown={handleJobListKeyDown}
                aria-label="Job search results"
                aria-activedescendant={
                  focusedJobIndex !== null && sortedJobs[focusedJobIndex]
                    ? 'job-' + sortedJobs[focusedJobIndex].id
                    : undefined
                }
                data-handoff-target="pick-a-role"
              >
                {sortedJobs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No positions found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {sortedJobs.map(function (job, index) {
                      const isSelected = selectedJob && selectedJob.id === job.id;
                      const isFocused = focusedJobIndex === index;
                      const locationLower = job.location.toLowerCase();
                      const isRemote = locationLower.indexOf('remote') !== -1;
                      const teleworkLabel = isRemote ? 'Remote' : 'Hybrid';

                      /**
                       * Job Row Element (Day 19 Fix: Nested Button Hydration Error)
                       * ============================================================
                       * 
                       * WHY DIV INSTEAD OF BUTTON:
                       * Previously this was a <button> which caused hydration errors
                       * because the Save icon inside is also a <button>. HTML does not
                       * allow nested buttons (<button> cannot be descendant of <button>).
                       * 
                       * ACCESSIBILITY PRESERVED:
                       * - role="option" maintains listbox semantics
                       * - tabIndex={0} makes it focusable
                       * - onKeyDown handles Enter/Space for selection (like a button)
                       * - aria-selected indicates current selection state
                       * 
                       * The inner Save button uses e.stopPropagation() to prevent
                       * row selection when clicking save.
                       */
                      return (
                        <div
                          key={job.id}
                          id={'job-' + job.id}
                          data-job-index={index}
                          role="option"
                          tabIndex={0}
                          aria-selected={isSelected ? true : false}
                          className={
                            'w-full text-left p-3 hover:bg-muted/30 transition-colors cursor-pointer ' +
                            (isSelected
                              ? 'bg-accent/10 border-l-4 border-l-accent'
                              : isFocused
                                ? 'bg-muted/20 border-l-4 border-l-muted-foreground ring-2 ring-inset ring-accent/50'
                                : 'border-l-4 border-l-transparent')
                          }
                          onClick={function () {
                            setSelectedJob(job);
                            setFocusedJobIndex(index);
                            // On mobile, open the details slide-over
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setJobDetailsOpen(true);
                            }
                          }}
                          onKeyDown={function (e: React.KeyboardEvent<HTMLDivElement>) {
                            // Handle Enter/Space to select job (replaces button default behavior)
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedJob(job);
                              setFocusedJobIndex(index);
                              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                setJobDetailsOpen(true);
                              }
                            }
                          }}
                          onFocus={function () {
                            setFocusedJobIndex(index);
                          }}
                          aria-label={'Select ' + job.role + ' at ' + job.agency}
                        >
                          {/* Row 1: Title, save button, and match badge */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground truncate">{job.role}</h3>
                              <p className="text-xs text-muted-foreground truncate">{job.agency}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Save/Unsave button (Day 19) */}
                              <button
                                type="button"
                                onClick={function (e) {
                                  handleSaveJobFromCard(job, e);
                                }}
                                className={
                                  'p-1.5 rounded-full transition-colors ' +
                                  (isSavedFn(String(job.id))
                                    ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                                }
                                aria-label={isSavedFn(String(job.id)) ? 'Unsave job' : 'Save job'}
                              >
                                {isSavedFn(String(job.id)) ? (
                                  <BookmarkCheck className="w-4 h-4" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                              <Badge
                                variant={job.matchPercent >= 90 ? 'default' : 'secondary'}
                                className={
                                  job.matchPercent >= 90 ? 'bg-accent text-accent-foreground' : ''
                                }
                              >
                                {job.matchPercent}%
                              </Badge>
                            </div>
                          </div>

                          {/* Row 2: Key signals */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-foreground">{job.grade}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              {teleworkLabel}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <SensitiveValue
                                value={'$' + job.estTotalComp.toLocaleString()}
                                masked="$•••,•••"
                                hide={globalHide}
                                className="font-medium text-foreground"
                              />
                              <span>/yr</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Closes Dec 31
                            </span>
                            {user.currentEmployee && (
                              <span
                                className={
                                  job.retirementImpact.indexOf('+') !== -1
                                    ? 'text-red-400'
                                    : job.retirementImpact.indexOf('-') !== -1
                                      ? 'text-green-400'
                                      : ''
                                }
                              >
                                Retire: {job.retirementImpact}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Job Alerts Widget */}
              <JobAlertsWidget
                onOpenWorkspace={function () {
                  setJobSearchWorkspaceOpen(true);
                }}
              />
                </>
              )}

              {/* ================================================================
                  SAVED TAB CONTENT (Day 19 - Enhanced)
                  ================================================================
                  
                  PURPOSE:
                  Displays the user's saved jobs collection. Provides:
                  - Search input for client-side filtering (Day 19)
                  - Clear all button with confirmation (Day 19)
                  - List of saved job cards
                  - Actions: Unsave, View details, Tailor resume
                  - Empty state with CTA to browse jobs
                  ================================================================ */}
              {activeTab === 'saved' && (
                <div className="space-y-4 pt-2">
                  {savedJobs.length === 0 ? (
                    // Empty state (no saved jobs at all)
                    <div className="text-center py-12 text-muted-foreground">
                      <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="font-medium text-foreground mb-2">No saved jobs yet</h3>
                      <p className="text-sm mb-4">
                        Save jobs you&apos;re interested in to compare them later.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={function () {
                          setActiveTab('results');
                        }}
                      >
                        Browse jobs
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* ================================================================
                          SEARCH AND CLEAR CONTROLS (Day 19)
                          ================================================================ */}
                      <div className="flex items-center gap-2">
                        {/* Search input for saved jobs */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search saved jobs..."
                            className="pl-10 h-9 bg-background"
                            value={savedJobsSearchQuery}
                            onChange={function (e) {
                              setSavedJobsSearchQuery(e.target.value);
                            }}
                            aria-label="Search saved jobs"
                          />
                          {savedJobsSearchQuery && savedJobsSearchQuery.length > 0 && (
                            <button
                              type="button"
                              onClick={function () {
                                setSavedJobsSearchQuery('');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                              aria-label="Clear search"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        {/* Clear all button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 text-xs text-muted-foreground hover:text-destructive"
                          onClick={function () {
                            setShowClearSavedJobsConfirm(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Clear all
                        </Button>
                      </div>

                      {/* Confirmation dialog for clearing saved jobs */}
                      {showClearSavedJobsConfirm && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                          <p className="text-sm font-medium text-destructive mb-2">
                            Clear all {savedJobs.length} saved jobs?
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            This action cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleClearAllSavedJobs}
                            >
                              Yes, clear all
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={function () {
                                setShowClearSavedJobsConfirm(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* Saved jobs list with client-side filtering */}
                    {(function renderFilteredSavedJobs() {
                      // Filter saved jobs by search query
                      const filteredSavedJobs: SavedJobSummary[] = [];
                      const queryLower = savedJobsSearchQuery.toLowerCase().trim();

                      for (let i = 0; i < savedJobs.length; i++) {
                        const job = savedJobs[i];
                        if (queryLower === '') {
                          filteredSavedJobs.push(job);
                        } else {
                          // Check title, organization, or grade
                          const matchesTitle = job.title.toLowerCase().indexOf(queryLower) !== -1;
                          const matchesOrg = job.organizationName.toLowerCase().indexOf(queryLower) !== -1;
                          const matchesGrade = job.gradeLevel.toLowerCase().indexOf(queryLower) !== -1;
                          const matchesSeries = job.seriesCode.toLowerCase().indexOf(queryLower) !== -1;
                          
                          if (matchesTitle || matchesOrg || matchesGrade || matchesSeries) {
                            filteredSavedJobs.push(job);
                          }
                        }
                      }

                      if (filteredSavedJobs.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No saved jobs match &quot;{savedJobsSearchQuery}&quot;</p>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="text-xs mt-1"
                              onClick={function () {
                                setSavedJobsSearchQuery('');
                              }}
                            >
                              Clear search
                            </Button>
                          </div>
                        );
                      }

                      return (
                    <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                      {filteredSavedJobs.map(function (savedJob) {
                        const locationLower = savedJob.locationDisplay.toLowerCase();
                        const isRemote = locationLower.indexOf('remote') !== -1;
                        const teleworkLabel = isRemote ? 'Remote' : 'Hybrid';

                        return (
                          <div
                            key={savedJob.id}
                            className="p-3 hover:bg-muted/30 transition-colors"
                          >
                            {/* Row 1: Title, agency, match badge */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-foreground truncate">
                                  {savedJob.title}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {savedJob.organizationName}
                                </p>
                              </div>
                              <Badge
                                variant={savedJob.matchPercent >= 90 ? 'default' : 'secondary'}
                                className={
                                  'flex-shrink-0 ' +
                                  (savedJob.matchPercent >= 90 ? 'bg-accent text-accent-foreground' : '')
                                }
                              >
                                {savedJob.matchPercent}%
                              </Badge>
                            </div>

                            {/* Row 2: Key signals */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                              <span className="font-medium text-foreground">{savedJob.gradeLevel}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {savedJob.locationDisplay}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {teleworkLabel}
                              </Badge>
                              <SensitiveValue
                                value={'$' + savedJob.estimatedTotalComp.toLocaleString() + '/yr'}
                                masked="$•••,•••/yr"
                                hide={globalHide}
                                className="font-medium text-foreground"
                              />
                            </div>

                            {/* Row 3: Actions
                                DAY 15 FIX: Added Tailor button per prompt requirement.
                                Saved job rows must include: View details, Unsave, and Tailor.
                            */}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={function () {
                                  handleViewSavedJobDetails(savedJob);
                                }}
                              >
                                <Eye className="w-3 h-3" />
                                View details
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                className="h-7 text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
                                onClick={function () {
                                  handleTailorSavedJob(savedJob);
                                }}
                              >
                                <Sparkles className="w-3 h-3" />
                                Tailor
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-muted-foreground"
                                onClick={function () {
                                  handleUnsaveJob(savedJob.id, savedJob.title);
                                }}
                              >
                                <Bookmark className="w-3 h-3" />
                                Unsave
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                      );
                    })()}

                  {/* Saved jobs count and info */}
                  <p className="text-xs text-muted-foreground text-center">
                    {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}
                  </p>
                    </>
                  )}
                </div>
              )}

              {/* ================================================================
                  ALERTS TAB CONTENT (Day 19)
                  ================================================================
                  
                  PURPOSE:
                  Displays and manages job alerts. Provides:
                  - List of alerts with enable/disable, frequency, edit, delete
                  - Match count preview
                  - Clear all button
                  - Empty state with CTA
                  ================================================================ */}
              {activeTab === 'alerts' && (
                <div className="space-y-4 pt-2">
                  {alerts.length === 0 ? (
                    // Empty state
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="font-medium text-foreground mb-2">No job alerts yet</h3>
                      <p className="text-sm mb-4">
                        Create an alert from any job to get notified of similar positions.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={function () {
                          setActiveTab('results');
                        }}
                      >
                        Browse jobs
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Clear all alerts button */}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 text-xs text-muted-foreground hover:text-destructive"
                          onClick={function () {
                            setShowClearAlertsConfirm(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Clear all
                        </Button>
                      </div>

                      {/* Confirmation dialog for clearing alerts */}
                      {showClearAlertsConfirm && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                          <p className="text-sm font-medium text-destructive mb-2">
                            Clear all {alerts.length} alerts?
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            This action cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleClearAllAlerts}
                            >
                              Yes, clear all
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={function () {
                                setShowClearAlertsConfirm(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Alerts list */}
                      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                        {alerts.map(function (alert) {
                          return (
                            <div
                              key={alert.id}
                              className="p-3 hover:bg-muted/30 transition-colors"
                            >
                              {/* Row 1: Name and enable toggle */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-foreground truncate">
                                    {alert.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    Keywords: {alert.keywords}
                                    {alert.series && ' • ' + alert.series}
                                    {alert.gradeBand && ' • ' + alert.gradeBand.toUpperCase()}
                                    {alert.remoteOnly && ' • Remote only'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={function () {
                                    handleToggleAlert(alert.id);
                                  }}
                                  className={
                                    'p-1.5 rounded-full transition-colors ' +
                                    (alert.enabled
                                      ? 'bg-accent text-accent-foreground'
                                      : 'bg-muted text-muted-foreground')
                                  }
                                  aria-label={alert.enabled ? 'Disable alert' : 'Enable alert'}
                                >
                                  {alert.enabled ? (
                                    <Bell className="w-4 h-4" />
                                  ) : (
                                    <BellOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              {/* Row 2: Match count and frequency */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {alert.lastRunAt === null ? (
                                  <span className="text-amber-500">Not run yet</span>
                                ) : alert.lastMatchCount === 0 ? (
                                  <span>0 matches</span>
                                ) : (
                                  <span className="text-green-500 font-medium">
                                    {alert.lastMatchCount} {alert.lastMatchCount === 1 ? 'match' : 'matches'}
                                  </span>
                                )}
                                <span>•</span>
                                <Select
                                  value={alert.frequency}
                                  onValueChange={function (value: string) {
                                    if (value === 'daily' || value === 'weekly') {
                                      handleUpdateAlertFrequency(alert.id, value);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-6 w-20 text-[10px] border-0 bg-transparent p-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                                    <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Row 3: Actions */}
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={function () {
                                    setEditingAlert(alert);
                                  }}
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
                                  onClick={function () {
                                    handleDeleteAlert(alert.id, alert.name);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Alerts count */}
                      <p className="text-xs text-muted-foreground text-center">
                        {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================================
              SELECTED JOB PANEL
              ================================================================
              
              PURPOSE:
              Displays structured information about the selected job:
              - Job summary at top (title, agency, grade, location, pay)
              - Primary CTAs (View position details, Tailor my resume)
              - Secondary actions (Save job, Ask PathAdvisor)
              - "Why this matches" accordion with 3 sections
              
              LAYOUT:
              - Hidden on mobile (details open in slide-over instead)
              - Shown on desktop (lg:block)
              - Takes 2 columns in the 5-column grid
              ================================================================ */}
          <div className="hidden lg:block lg:col-span-2">
            {/* ================================================================
                NOTE (Day 15 Session 7): onSaveJob prop removed.
                Save job is now handled internally by SelectedJobPanel using
                useSavedJobsStore with toggle behavior and visual feedback.
                ================================================================ */}
            <SelectedJobPanel
              job={selectedJob}
              isEmployee={user.currentEmployee}
              globalHide={globalHide}
              onViewDetails={function () {
                setJobDetailsOpen(true);
              }}
              onTailorResume={handleTailorResume}
              onAskPathAdvisor={handleGetApplicationTips}
              usajobsUrl={selectedJob ? 'https://www.usajobs.gov/job/' + selectedJob.id : null}
              insightsLoading={insightsLoading}
              pathAdvisorInsights={pathAdvisorInsights}
            />
          </div>
        </div>

        {/* ================================================================
            PATHADVISOR RECOMMENDATION CARD (Day 33 Update)
            ================================================================
            
            PURPOSE:
            Full recommendation experience in Job Search tab.
            Shows complete recommendation with all rationale bullets and multiple actions.
            This is the "full" variant - Dashboard shows only a preview.
            
            DESIGN:
            - Full variant shows all rationale bullets (2-4 items)
            - Multiple action buttons (1-3 items)
            - Confidence indicator visible
            - Complete recommendation workspace
            
            GATING (Day 33):
            - Shows ONLY when a job is selected (hasSelectedJob is true)
            - Hidden when no job is selected to avoid stacked recommendation noise
            ================================================================ */}
        {hasSelectedJob && <JobRecommendationCard variant="full" />}

        {/* ================================================================
            RECOMMENDED ROLES
            ================================================================
            
            PURPOSE:
            Shows personalized job recommendations based on user profile.
            
            ACTIONS PER CARD:
            - "Similar roles" applies filters to find similar jobs
            - "Why recommended" shows a tooltip explaining the match
            
            GATING (Day 33):
            - Shows ONLY when no job is selected (hasSelectedJob is false) AND results exist (hasResults is true)
            - Hidden when a job is selected to avoid stacked recommendation noise
            - If no results exist, this card is also hidden (per gating rules)
            ================================================================ */}
        {!hasSelectedJob && hasResults && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Recommended roles based on your profile
                </CardTitle>
                <CardDescription className="hidden sm:block">
                  {user.currentEmployee
                    ? 'Career progression opportunities matching your skills and goals'
                    : 'Entry-level positions that match your background and interests'}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={recommendationsVisibility.toggle}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                aria-label={recommendationsVisibility.visible ? 'Hide this card' : 'Show this card'}
              >
                {recommendationsVisibility.visible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!recommendationsVisibility.visible ? (
              <div className="text-center py-8 text-muted-foreground">
                <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">This card is hidden.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    recommendationsVisibility.setVisible(true);
                  }}
                >
                  Show this card
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
                {recommendedRoles.map(function (role) {
                  return (
                    <div
                      key={role.id}
                      className="flex-shrink-0 w-60 lg:w-72 bg-muted/30 rounded-lg p-3 lg:p-4 border border-border snap-start"
                    >
                      {/* Header: Title and match badge */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground text-sm">{role.title}</h4>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          <SensitiveValue
                            value={role.matchPercent + '%'}
                            masked="••%"
                            hide={recommendationsVisibility.isSensitiveHidden}
                          />
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        {role.locationDisplay}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {role.tags.slice(0, 3).map(function (tag) {
                          return (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs bg-transparent gap-1"
                          onClick={function () {
                            // Apply filters to search for similar roles
                            // This uses the role's tags as a proxy for series/type
                            setJobSearchFilters({
                              query: role.title,
                            });
                          }}
                        >
                          <Search className="w-3 h-3" />
                          Similar roles
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          title={'Why recommended: Your skills match ' + role.matchPercent + '% of requirements for ' + role.title}
                        >
                          <Sparkles className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Dialogs and Modals */}
        <JobSearchWorkspaceDialog
          open={jobSearchWorkspaceOpen}
          onOpenChange={setJobSearchWorkspaceOpen}
        />
        <MoreFiltersPanel open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen} />
        <SeriesGuidePanel open={seriesGuideOpen} onOpenChange={setSeriesGuideOpen} />
        {/* Job Details Slide-Over - Convert legacy format to JobData (Day 12) */}
        <JobDetailsSlideOver
          open={jobDetailsOpen}
          onOpenChange={setJobDetailsOpen}
          job={selectedJob ? {
            // Canonical fields (Day 12)
            id: String(selectedJob.id),
            title: selectedJob.role,
            seriesCode: selectedJob.series,
            gradeLevel: selectedJob.grade,
            locationDisplay: selectedJob.location,
            organizationName: selectedJob.agency,
            employmentType: selectedJob.type,
            estimatedTotalComp: selectedJob.estTotalComp,
            matchPercent: selectedJob.matchPercent,
            retirementImpact: selectedJob.retirementImpact,
            // Legacy fields for backward compatibility
            role: selectedJob.role,
            series: selectedJob.series,
            grade: selectedJob.grade,
            location: selectedJob.location,
            agency: selectedJob.agency,
            type: selectedJob.type,
            estTotalComp: selectedJob.estTotalComp,
          } : null}
          onNavigateToJobSearch={function () {
            setJobSearchWorkspaceOpen(true);
          }}
          showTailorCTA={true}
          onTailorClick={handleTailorResume}
        />
      </div>

      {/* ================================================================
          EDIT ALERT DIALOG (Day 19)
          ================================================================
          
          PURPOSE:
          Modal for editing an existing alert's settings:
          - Keywords
          - Frequency (daily/weekly)
          - Remote only toggle
          ================================================================ */}
      <Dialog
        open={editingAlert !== null}
        onOpenChange={function (open: boolean) {
          if (!open) {
            setEditingAlert(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogDescription>
              Modify your job alert settings.
            </DialogDescription>
          </DialogHeader>
          {editingAlert && (
            <div className="space-y-4 py-4">
              {/* Alert name (read-only) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Alert Name</Label>
                <p className="text-sm text-muted-foreground">{editingAlert.name}</p>
              </div>

              {/* Keywords (read-only display) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Keywords</Label>
                <p className="text-sm text-muted-foreground">{editingAlert.keywords}</p>
              </div>

              {/* Criteria summary (read-only display) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Criteria</Label>
                <p className="text-sm text-muted-foreground">
                  {editingAlert.series && 'Series: ' + editingAlert.series}
                  {editingAlert.gradeBand && (editingAlert.series ? ' • ' : '') + 'Grade: ' + editingAlert.gradeBand.toUpperCase()}
                  {editingAlert.location && ((editingAlert.series || editingAlert.gradeBand) ? ' • ' : '') + 'Location: ' + editingAlert.location}
                  {!editingAlert.series && !editingAlert.gradeBand && !editingAlert.location && 'No additional filters'}
                </p>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Frequency</Label>
                <Select
                  value={editingAlert.frequency}
                  onValueChange={function (value: string) {
                    if (value === 'daily' || value === 'weekly') {
                      setEditingAlert({
                        ...editingAlert,
                        frequency: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Remote only toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Remote Only</Label>
                  <p className="text-xs text-muted-foreground">Only match remote positions</p>
                </div>
                <Switch
                  checked={editingAlert.remoteOnly}
                  onCheckedChange={function (checked: boolean) {
                    setEditingAlert({
                      ...editingAlert,
                      remoteOnly: checked,
                    });
                  }}
                />
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enabled</Label>
                  <p className="text-xs text-muted-foreground">Track matches in your Alerts tab</p>
                </div>
                <Switch
                  checked={editingAlert.enabled}
                  onCheckedChange={function (checked: boolean) {
                    setEditingAlert({
                      ...editingAlert,
                      enabled: checked,
                    });
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={function () {
                setEditingAlert(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditedAlert}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
