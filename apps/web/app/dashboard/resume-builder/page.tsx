/**
 * ============================================================================
 * RESUME BUILDER PAGE
 * ============================================================================
 *
 * FILE PURPOSE:
 * Federal resume builder with step-by-step wizard interface. Supports both
 * general resume building and tailoring mode for specific job applications.
 *
 * WHERE IT FITS IN PATHOS ARCHITECTURE:
 * - Located at /dashboard/resume-builder
 * - Integrates with Job Search for tailoring to specific jobs
 * - Uses JobDetailsSlideOver for viewing target job details
 * - Shows Career Outlook in tailoring mode (Day 10)
 *
 * CAREER OUTLOOK INTEGRATION (Day 10):
 * - When in tailoring mode, shows compact Career Outlook for the target job
 * - Displayed in the tailoring banner area
 * - Helps users understand the value of the job they're tailoring for
 *
 * @version Updated for Day 10 - Job Seeker Intelligence Layer
 * ============================================================================
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ChevronRight,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserPreferencesStore } from '@/store/userPreferencesStore';
import { useResumeBuilderStore } from '@/store/resumeBuilderStore';
import { useAdvisorContext } from '@/contexts/advisor-context';
import { usePathAdvisorInsights } from '@/hooks/use-pathadvisor-insights';
import type { PathScenario } from '@/types/pathadvisor';
import { ReviewExportStep } from '@/components/resume-builder/review-export-step';
// Day 43: Use askPathAdvisor for anchor-first Focus Mode opening
import { askPathAdvisor } from '@/lib/pathadvisor/askPathAdvisor';
// Focus handler for deep-linking from Career page (Day 14 bugfix)
import { ResumeBuilderFocusHandler } from '@/components/resume-builder/resume-builder-focus-handler';
import {
  ResumeStrengthPanel,
  type ResumeStrengthData,
  type StrengthCheckItem,
} from '@/components/resume-builder/resume-strength-panel';
import { JobDetailsSlideOver } from '@/components/dashboard/job-details-slideover';
import { PageShell } from '@/components/layout/page-shell';
// Day 38: Two-pane workspace
import { ResumeWorkspace } from '@/components/resume-builder/resume-workspace';
// Day 38 Overlay v1: Tailoring Workspace Overlay (full-screen modal)
import { TailoringWorkspaceOverlay } from '@/components/resume-builder/tailoring-workspace-overlay';
// Day 38 Continuation: Job picker modal
import { JobPickerModal } from '@/components/resume-builder/job-picker-modal';
// Day 38: Resume actions bar
import { ResumeActionsBar } from '@/components/resume-builder/resume-actions-bar';
// Day 38: Resume domain model for version management
import type { ResumeDocument, ResumeVersion } from '@/lib/resume/resume-domain-model';
import { resumeDataToDocument } from '@/lib/resume/resume-helpers';
// Day 38: Dialog components for modals
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResumePreviewPane } from '@/components/resume-builder/resume-preview-pane';
import { toast } from '@/hooks/use-toast';
// Day 43: Resume Review Modal (mode, not navigation)
import { ResumeReviewModal } from '@/components/resume-builder/resume-review-modal';


const STEPS = [
  { id: 'profile', label: 'Profile', description: 'Contact information' },
  { id: 'target-roles', label: 'Target Roles', description: 'Desired positions' },
  { id: 'work-experience', label: 'Work Experience', description: 'Employment history' },
  { id: 'education', label: 'Education', description: 'Degrees and training' },
  { id: 'skills', label: 'Skills', description: 'Competencies and KSAs' },
  { id: 'review', label: 'Review & Export', description: 'Preview and download' },
];

export type UserType = 'jobseeker' | 'employee';

export type ResumeData = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    citizenship: string;
    veteranStatus: string;
    securityClearance: string;
    currentAgency?: string;
    currentSeries?: string;
    currentGrade?: string;
  };
  targetRoles: Array<{
    id: string;
    title: string;
    series: string;
    gradeMin: string;
    gradeMax: string;
    location: string;
  }>;
  workExperience: Array<{
    id: string;
    employer: string;
    title: string;
    series?: string;
    grade?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    hoursPerWeek: string;
    salary?: string;
    supervisorName?: string;
    supervisorPhone?: string;
    duties: string;
    accomplishments: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    credits?: string;
  }>;
  skills: {
    technicalSkills: string[];
    certifications: string[];
    languages: string[];
    ksas: string;
  };
};

export default function ResumeBuilderPage() {
  const globalHide = useUserPreferencesStore(function (state) {
    return state.isSensitiveHidden;
  });

  const advisorContextData = useAdvisorContext();
  const setAdvisorContext = advisorContextData.setContext;
  const setScreenInfo = advisorContextData.setScreenInfo;
  const setPendingPrompt = advisorContextData.setPendingPrompt;
  const setShouldOpenFocusMode = advisorContextData.setShouldOpenFocusMode;
  const setOnPathAdvisorClose = advisorContextData.setOnPathAdvisorClose;

  // Resume builder store - state
  const activeTargetJob = useResumeBuilderStore(function (state) {
    return state.activeTargetJob;
  });
  const isTailoringMode = useResumeBuilderStore(function (state) {
    return state.isTailoringMode;
  });
  const resumeData = useResumeBuilderStore(function (state) {
    return state.resumeData;
  });
  const currentStep = useResumeBuilderStore(function (state) {
    return state.currentStep;
  });

  // Resume builder store - actions
  const setCurrentStep = useResumeBuilderStore(function (state) {
    return state.setCurrentStep;
  });
  const setResumeData = useResumeBuilderStore(function (state) {
    return state.setResumeData;
  });
  const clearTailoringSession = useResumeBuilderStore(function (state) {
    return state.clearTailoringSession;
  });

  const searchParams = useSearchParams();

  // Day 38 Overlay v1: State to control workspace overlay open/close (separate from tailoring mode)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  // Day 38 Continuation: State to control job picker modal
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false);
  
  // Day 38: Version management state for default page header
  const [resumeDocument, setResumeDocument] = useState<ResumeDocument>(function () {
    return resumeDataToDocument({
      profile: {
        firstName: resumeData.profile.firstName,
        lastName: resumeData.profile.lastName,
        email: resumeData.profile.email,
        phone: resumeData.profile.phone,
        address: resumeData.profile.address,
        city: resumeData.profile.city,
        state: resumeData.profile.state,
        zip: resumeData.profile.zip,
        citizenship: resumeData.profile.citizenship,
        veteranStatus: resumeData.profile.veteranStatus,
        securityClearance: resumeData.profile.securityClearance,
        currentAgency: resumeData.profile.currentAgency || '',
        currentSeries: resumeData.profile.currentSeries || '',
        currentGrade: resumeData.profile.currentGrade || '',
      },
      targetRoles: resumeData.targetRoles,
      workExperience: resumeData.workExperience,
      education: resumeData.education,
      skills: resumeData.skills,
    });
  });
  
  // Day 38: Export and focus view modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFocusViewOpen, setIsFocusViewOpen] = useState(false);
  const [isSaveVersionModalOpen, setIsSaveVersionModalOpen] = useState(false);
  const [saveVersionName, setSaveVersionName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  // Day 43: Resume Review MODE state (not navigation)
  // This controls whether the Resume Review modal workspace is open.
  // Resume Builder remains mounted underneath, preserving all state.
  const [resumeReviewMode, setResumeReviewMode] = useState(false);

  // Day 38 Overlay v1: Open overlay when tailoring mode becomes active
  useEffect(
    function () {
      if (isTailoringMode && activeTargetJob) {
        setIsWorkspaceOpen(true);
      }
      // Note: We don't close overlay when tailoring mode exits, user may want to stay in workspace
    },
    [isTailoringMode, activeTargetJob]
  );
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);

  // PathAdvisor insights for tailoring mode
  const {
    fetchInsights,
  } = usePathAdvisorInsights();

  // Track if we've already set the initial tailoring prompt
  const hasSetTailoringPromptRef = useRef(false);

  // Fetch PathAdvisor insights when entering tailoring mode
  useEffect(
    function () {
      if (isTailoringMode && activeTargetJob) {
        const scenario: PathScenario = {
          targetGradeBand: activeTargetJob.grade,
          targetLocation: activeTargetJob.location,
          targetAgency: activeTargetJob.agency,
          jobId: activeTargetJob.jobId,
          jobSeries: activeTargetJob.series,
          jobTitle: activeTargetJob.title,
          scenarioType: activeTargetJob.moveType || 'entry',
        };
        fetchInsights(scenario);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTailoringMode, activeTargetJob?.jobId]
  );

  useEffect(
    function () {
      const stepParam = searchParams.get('step');
      if (stepParam) {
        let stepIndex = -1;
        for (let i = 0; i < STEPS.length; i++) {
          if (STEPS[i].id === stepParam) {
            stepIndex = i;
            break;
          }
        }
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex);
        }
      }
    },
    [searchParams, setCurrentStep],
  );

  // ============================================================================
  // Day 43: Auto-open Resume Review modal from query param
  // ============================================================================
  //
  // WHY THIS EXISTS:
  // The deprecated /dashboard/resume-builder/review route redirects here with
  // ?openReview=true. This ensures old bookmarks and links still work by
  // automatically opening the Review modal.
  //
  // BEHAVIOR:
  // 1. Check for openReview=true query param on mount
  // 2. If present, set resumeReviewMode to true (opens modal)
  // 3. Remove the query param from URL to prevent re-opening on refresh
  //
  // NOTE:
  // This is a one-time effect that only runs when the query param is present.
  // Subsequent page loads without the param do not trigger modal opening.
  // ============================================================================
  useEffect(
    function () {
      const openReviewParam = searchParams.get('openReview');
      if (openReviewParam === 'true') {
        // Open the Resume Review modal
        setResumeReviewMode(true);

        // Remove the query param from URL to prevent re-opening on refresh
        // Use window.history.replaceState to avoid a full page reload
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('openReview');
          window.history.replaceState({}, '', url.toString());
        }
      }
    },
    [searchParams],
  );

  const calculateResumeStrength = function (data: ResumeData): ResumeStrengthData {
    const checks: StrengthCheckItem[] = [];
    let score = 0;

    const hasProfile = data.profile.firstName && data.profile.lastName && data.profile.email;
    checks.push({
      id: 'profile',
      label: 'Contact information complete',
      status: hasProfile ? 'success' : 'incomplete',
      tip: 'Complete your contact information including name, email, and phone number for recruiters to reach you.',
    });
    if (hasProfile) score += 15;

    const hasTargetRoles = data.targetRoles.length > 0;
    checks.push({
      id: 'target-roles',
      label: 'Tailored to a target series',
      status: hasTargetRoles ? 'success' : 'warning',
      tip: 'Adding target roles helps tailor your resume to specific federal job series and increases your chances of matching.',
    });
    if (hasTargetRoles) score += 15;

    const hasWorkExperience = data.workExperience.length > 0;
    checks.push({
      id: 'work-experience',
      label: 'Recent work experience added',
      status: hasWorkExperience ? 'success' : 'warning',
      tip: 'Federal resumes require detailed work history with hours per week, supervisor info, and specific duties.',
    });
    if (hasWorkExperience) score += 20;

    let hasAccomplishments = false;
    for (let i = 0; i < data.workExperience.length; i++) {
      const exp = data.workExperience[i];
      if (exp.accomplishments && exp.accomplishments.length > 50) {
        hasAccomplishments = true;
        break;
      }
    }
    checks.push({
      id: 'accomplishments',
      label: 'Bullets with measurable results',
      status: hasAccomplishments ? 'success' : 'warning',
      tip: 'Use the STAR method (Situation, Task, Action, Result) to write accomplishments with specific numbers and outcomes.',
    });
    if (hasAccomplishments) score += 20;

    const hasEducation = data.education.length > 0;
    checks.push({
      id: 'education',
      label: 'Education credentials listed',
      status: hasEducation ? 'success' : 'incomplete',
      tip: "Include all degrees, relevant coursework, and any federal training programs you've completed.",
    });
    if (hasEducation) score += 15;

    const hasSkills = data.skills.technicalSkills.length > 0 || data.skills.ksas.length > 0;
    checks.push({
      id: 'skills',
      label: 'Skills and KSAs documented',
      status: hasSkills ? 'success' : 'incomplete',
      tip: 'Document your technical skills and write Knowledge, Skills, and Abilities (KSAs) that demonstrate your qualifications.',
    });
    if (hasSkills) score += 15;

    let label: 'Needs work' | 'Developing' | 'Strong' = 'Needs work';
    if (score >= 80) label = 'Strong';
    else if (score >= 50) label = 'Developing';

    return { score: score, label: label, checks: checks };
  };

  const handleStrengthCheckClick = function (item: StrengthCheckItem) {
    const stepMap: Record<string, number> = {
      profile: 0,
      'target-roles': 1,
      'work-experience': 2,
      accomplishments: 2,
      education: 3,
      skills: 4,
    };
    const stepIndex = stepMap[item.id];
    if (stepIndex !== undefined) {
      setCurrentStep(stepIndex);
    }
  };

  // Cast store data to local types for compatibility with step components
  const localResumeData: ResumeData = {
    profile: {
      firstName: resumeData.profile.firstName,
      lastName: resumeData.profile.lastName,
      email: resumeData.profile.email,
      phone: resumeData.profile.phone,
      address: resumeData.profile.address,
      city: resumeData.profile.city,
      state: resumeData.profile.state,
      zip: resumeData.profile.zip,
      citizenship: resumeData.profile.citizenship,
      veteranStatus: resumeData.profile.veteranStatus,
      securityClearance: resumeData.profile.securityClearance,
      currentAgency: resumeData.profile.currentAgency,
      currentSeries: resumeData.profile.currentSeries,
      currentGrade: resumeData.profile.currentGrade,
    },
    targetRoles: resumeData.targetRoles.map(function (role) {
      return {
        id: role.id,
        title: role.title,
        series: role.series,
        gradeMin: role.gradeMin,
        gradeMax: role.gradeMax,
        location: role.location,
      };
    }),
    workExperience: resumeData.workExperience.map(function (exp) {
      return {
        id: exp.id,
        employer: exp.employer,
        title: exp.title,
        series: exp.series,
        grade: exp.grade,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        hoursPerWeek: exp.hoursPerWeek,
        salary: exp.salary,
        supervisorName: exp.supervisorName,
        supervisorPhone: exp.supervisorPhone,
        duties: exp.duties,
        accomplishments: exp.accomplishments,
      };
    }),
    education: resumeData.education.map(function (edu) {
      return {
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        graduationDate: edu.graduationDate,
        gpa: edu.gpa,
        credits: edu.credits,
      };
    }),
    skills: {
      technicalSkills: resumeData.skills.technicalSkills,
      certifications: resumeData.skills.certifications,
      languages: resumeData.skills.languages,
      ksas: resumeData.skills.ksas,
    },
  };

  // Calculate resume strength using the local data
  const resumeStrength = calculateResumeStrength(localResumeData);
  
  // Day 38: Update resume document when store data changes
  useEffect(
    function () {
      const normalized = {
        profile: {
          firstName: resumeData.profile.firstName,
          lastName: resumeData.profile.lastName,
          email: resumeData.profile.email,
          phone: resumeData.profile.phone,
          address: resumeData.profile.address,
          city: resumeData.profile.city,
          state: resumeData.profile.state,
          zip: resumeData.profile.zip,
          citizenship: resumeData.profile.citizenship,
          veteranStatus: resumeData.profile.veteranStatus,
          securityClearance: resumeData.profile.securityClearance,
          currentAgency: resumeData.profile.currentAgency || '',
          currentSeries: resumeData.profile.currentSeries || '',
          currentGrade: resumeData.profile.currentGrade || '',
        },
        targetRoles: resumeData.targetRoles,
        workExperience: resumeData.workExperience,
        education: resumeData.education,
        skills: resumeData.skills,
      };
      
      setResumeDocument(function (prevDoc) {
        // Update base version snapshot
        const activeVersion = prevDoc.versions.find(function (v) {
          return v.id === prevDoc.activeVersionId;
        });
        if (activeVersion) {
          activeVersion.snapshot = {
            profile: normalized.profile,
            targetRoles: normalized.targetRoles,
            workExperience: normalized.workExperience,
            education: normalized.education,
            skills: normalized.skills,
          };
          activeVersion.updatedAt = Date.now();
        }
        
        return Object.assign({}, prevDoc, {
          baseProfile: normalized.profile,
          baseSections: {
            targetRoles: normalized.targetRoles,
            workExperience: normalized.workExperience,
            education: normalized.education,
            skills: normalized.skills,
          },
          versions: prevDoc.versions,
        });
      });
      setSaveStatus('unsaved');
    },
    [resumeData]
  );
  
  // Day 38: Version management handlers
  const handleCreateVersion = function () {
    const now = Date.now();
    const versionNumber = resumeDocument.versions.length + 1;
    const activeVersion = resumeDocument.versions.find(function (v) {
      return v.id === resumeDocument.activeVersionId;
    });
    if (!activeVersion) return;
    
    const snapshotCopy = JSON.parse(JSON.stringify(activeVersion.snapshot));
    const newVersion: ResumeVersion = {
      id: 'version-' + now,
      name: saveVersionName.trim() || 'Version ' + versionNumber,
      createdAt: now,
      updatedAt: now,
      isBase: false,
      snapshot: snapshotCopy,
      metadata: {},
    };
    
    const newVersions = resumeDocument.versions.slice();
    newVersions.push(newVersion);
    
    setResumeDocument(Object.assign({}, resumeDocument, {
      versions: newVersions,
      activeVersionId: newVersion.id,
    }));
    
    // Persist to localStorage
    try {
      const versionsKey = 'resume-builder-versions';
      const existingVersions = localStorage.getItem(versionsKey);
      const allVersions = existingVersions ? JSON.parse(existingVersions) : [];
      allVersions.push({
        id: newVersion.id,
        name: newVersion.name,
        createdAt: newVersion.createdAt,
        updatedAt: newVersion.updatedAt,
        snapshot: newVersion.snapshot,
      });
      localStorage.setItem(versionsKey, JSON.stringify(allVersions));
    } catch (e) {
      console.error('Failed to persist version:', e);
    }
    
    setSaveStatus('saved');
    setIsSaveVersionModalOpen(false);
    setSaveVersionName('');
    toast({
      title: 'Version saved',
      description: 'Your resume version has been saved',
    });
  };
  
  const handleSelectVersion = function (versionId: string) {
    const version = resumeDocument.versions.find(function (v) {
      return v.id === versionId;
    });
    if (!version) return;
    
    // Update store with selected version's data
    setResumeData({
      profile: {
        firstName: version.snapshot.profile.firstName,
        lastName: version.snapshot.profile.lastName,
        email: version.snapshot.profile.email,
        phone: version.snapshot.profile.phone,
        address: version.snapshot.profile.address,
        city: version.snapshot.profile.city,
        state: version.snapshot.profile.state,
        zip: version.snapshot.profile.zip,
        citizenship: version.snapshot.profile.citizenship,
        veteranStatus: version.snapshot.profile.veteranStatus,
        securityClearance: version.snapshot.profile.securityClearance,
        currentAgency: version.snapshot.profile.currentAgency || '',
        currentSeries: version.snapshot.profile.currentSeries || '',
        currentGrade: version.snapshot.profile.currentGrade || '',
      },
      targetRoles: version.snapshot.targetRoles,
      workExperience: version.snapshot.workExperience,
      education: version.snapshot.education,
      skills: version.snapshot.skills,
    });
    
    setResumeDocument(Object.assign({}, resumeDocument, {
      activeVersionId: versionId,
    }));
  };
  
  const handleSaveVersion = function () {
    const versionNumber = resumeDocument.versions.length + 1;
    setSaveVersionName('Version ' + versionNumber);
    setIsSaveVersionModalOpen(true);
  };
  
  const handleExport = function () {
    setIsExportModalOpen(true);
  };
  
  const handleFocusView = function () {
    setIsFocusViewOpen(true);
  };
  
  // Get active version and view
  const activeVersion = resumeDocument.versions.find(function (v) {
    return v.id === resumeDocument.activeVersionId;
  });
  const activeView = resumeDocument.views.find(function (v) {
    return v.id === resumeDocument.activeViewId;
  });
  
  // Current resume data for export/focus view (from active version)
  const currentResumeDataForPreview: ResumeData = activeVersion
    ? {
        profile: {
          firstName: activeVersion.snapshot.profile.firstName,
          lastName: activeVersion.snapshot.profile.lastName,
          email: activeVersion.snapshot.profile.email,
          phone: activeVersion.snapshot.profile.phone,
          address: activeVersion.snapshot.profile.address,
          city: activeVersion.snapshot.profile.city,
          state: activeVersion.snapshot.profile.state,
          zip: activeVersion.snapshot.profile.zip,
          citizenship: activeVersion.snapshot.profile.citizenship,
          veteranStatus: activeVersion.snapshot.profile.veteranStatus,
          securityClearance: activeVersion.snapshot.profile.securityClearance,
          currentAgency: activeVersion.snapshot.profile.currentAgency || undefined,
          currentSeries: activeVersion.snapshot.profile.currentSeries || undefined,
          currentGrade: activeVersion.snapshot.profile.currentGrade || undefined,
        },
        targetRoles: activeVersion.snapshot.targetRoles,
        workExperience: activeVersion.snapshot.workExperience,
        education: activeVersion.snapshot.education,
        skills: activeVersion.snapshot.skills,
      }
    : localResumeData;

  /**
   * Day 39: Callback to open global PathAdvisor expanded modal from Resume Builder Export.
   * 
   * HOW IT WORKS:
   * 1. Sets advisor context to 'screen' source (resume export is a screen-level action)
   * 2. Builds a helpful review prompt based on resume data
   * 3. Seeds the prompt in PathAdvisor
   * 4. Opens the global PathAdvisor expanded modal (PathAdvisorFocusMode)
   * 5. Closes the export modal (better UX - user can see PathAdvisor immediately)
   * 
   * PROMPT CONTENT:
   * Asks PathAdvisor to review resume export for USAJOBS, checking:
   * - Work history completeness (hours/week, dates, supervisor info)
   * - Quantified accomplishments (metrics, scope, outcomes)
   * - Keyword alignment to target roles/series/grade bands
   * - Clarity and formatting for USAJOBS style (duties vs accomplishments)
   * 
   * COMPONENT WIRING RULE:
   * Resume Builder export must call GLOBAL expanded PathAdvisor.
   * This ensures the expanded modal opens, not just the sidebar panel.
   */
  const handleAskPathAdvisorForExport = function () {
    // ============================================================================
    // DAY 43: USE askPathAdvisor FOR ANCHOR-FIRST FOCUS MODE OPENING
    // ============================================================================
    //
    // PURPOSE:
    // Asks PathAdvisor to review resume export for USAJOBS, using the Day 43
    // anchor-first architecture. This ensures:
    // - Anchor is set with 'resume' source and meaningful sourceLabel/summary
    // - Focus Mode opens IMMEDIATELY (not just sidebar update)
    // - Context panel shows Resume Context in single-column layout
    //
    // DAY 43 ANCHOR CONTRACT:
    // - source: 'resume' (Resume Builder context)
    // - sourceLabel: "Resume Export Review" or includes target role info
    // - summary: Describes what we're asking about (export review)
    // ============================================================================

    // Build review prompt with target role context if available
    let prompt = 'Review my resume export for USAJOBS. Please check:\n';
    prompt += '- Work history completeness (hours/week, dates, supervisor info if present)\n';
    prompt += '- Quantified accomplishments (metrics, scope, outcomes)\n';
    prompt += '- Keyword alignment to my target roles/series/grade bands\n';
    prompt += '- Clarity and formatting for USAJOBS style (duties vs accomplishments)\n';
    prompt += 'Give concrete rewrite suggestions.';

    // Build source label with target role context if available
    let sourceLabel = 'Resume Export Review';
    let summary = 'Reviewing resume export before submitting to USAJOBS';

    if (currentResumeDataForPreview.targetRoles.length > 0) {
      const roles = currentResumeDataForPreview.targetRoles.map(function (role) {
        return role.title + ' (' + role.series + ', ' + role.gradeMin + '-' + role.gradeMax + ')';
      });
      prompt = 'Review my resume export for USAJOBS targeting: ' + roles.join(', ') + '. Please check:\n';
      prompt += '- Work history completeness (hours/week, dates, supervisor info if present)\n';
      prompt += '- Quantified accomplishments (metrics, scope, outcomes)\n';
      prompt += '- Keyword alignment to my target roles/series/grade bands\n';
      prompt += '- Clarity and formatting for USAJOBS style (duties vs accomplishments)\n';
      prompt += 'Give concrete rewrite suggestions.';

      // Enrich source label with target role
      sourceLabel = 'Resume Export: ' + currentResumeDataForPreview.targetRoles[0].title;
      summary = 'Reviewing resume for ' + roles.join(', ') + ' before USAJOBS';
    }

    // Close export modal first for better UX
    setIsExportModalOpen(false);

    // Day 43: Use askPathAdvisor (anchor-first, always opens Focus Mode)
    askPathAdvisor({
      source: 'resume',
      sourceLabel: sourceLabel,
      summary: summary,
      contextPayload: {
        source: 'recommendations', // Generic source for context
        prompt: prompt,
      },
      contextFunctions: {
        setContext: setAdvisorContext,
        setPendingPrompt: setPendingPrompt,
        setShouldOpenFocusMode: setShouldOpenFocusMode,
        setOnPathAdvisorClose: setOnPathAdvisorClose,
      },
    });
  };

  useEffect(function () {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    function () {
      const stepTips: Record<string, string> = {
        profile:
          'I can help you format your contact info for USAJOBS. Make sure to include a professional email address.',
        'target-roles':
          "Tell me about the roles you're interested in, and I'll help you tailor your resume to match specific job announcements.",
        'work-experience':
          'I can help you write strong accomplishment bullets using the STAR method (Situation, Task, Action, Result).',
        education:
          "Include relevant coursework and any federal training programs you've completed.",
        skills:
          'For KSAs, focus on specific examples that demonstrate your competencies. I can help you structure these effectively.',
        review: 'Review your resume for completeness. I can suggest improvements before you export.',
      };

      const currentStepId = STEPS[currentStep].id;

      if (isTailoringMode && activeTargetJob) {
        const screenPurpose =
          'Help the user tailor their resume to this specific federal job posting. Focus your suggestions on matching skills and experience to the ' +
          activeTargetJob.series +
          ' ' +
          activeTargetJob.grade +
          ' position at ' +
          activeTargetJob.agency +
          '.';

        // Set screen info with tailoring mode context
        setScreenInfo('Resume Builder – Tailoring Mode', screenPurpose);

        // Set advisor context for tailoring mode with job details
        setAdvisorContext({
          source: 'job-details',
          keyHighlights: [stepTips[currentStepId]],
          jobTitle: activeTargetJob.title,
          jobSeries: activeTargetJob.series,
          jobGrade: activeTargetJob.grade,
          jobAgency: activeTargetJob.agency,
          jobLocation: activeTargetJob.location,
        });

        // Set one-time tailoring prompt when entering tailoring mode
        if (!hasSetTailoringPromptRef.current) {
          hasSetTailoringPromptRef.current = true;
          const tailoringPrompt =
            'I am tailoring my resume for this specific federal job: ' +
            activeTargetJob.title +
            ' (' +
            activeTargetJob.series +
            ' ' +
            activeTargetJob.grade +
            ') at ' +
            activeTargetJob.agency +
            '. Based on my resume data and the job\'s series, grade, agency, and duties, identify the three biggest gaps and suggest improved bullet points for my most relevant experience.';
          setPendingPrompt(tailoringPrompt);
        }
      } else {
        const screenPurpose =
          'Help the user improve and complete their resume for federal job applications. Current step: ' +
          STEPS[currentStep].label;

        // Set screen info for non-tailoring mode
        setScreenInfo('Resume Builder', screenPurpose);

        // Set advisor context for non-tailoring mode
        setAdvisorContext({
          source: 'screen',
          keyHighlights: [stepTips[currentStepId]],
        });

        // Reset the tailoring prompt flag when not in tailoring mode
        hasSetTailoringPromptRef.current = false;
      }
    },
    [
      setAdvisorContext,
      setScreenInfo,
      setPendingPrompt,
      currentStep,
      isTailoringMode,
      activeTargetJob,
    ],
  );

  return (
    <PageShell fullWidth>
      {/* ================================================================
          RESUME BUILDER FOCUS HANDLER (Day 14 Bugfix)
          ================================================================
          This component handles deep-linking from the Career page.
          When a user clicks "Fix now" with resumeFocus=certifications:
            1. It reads the query param
            2. Navigates to the correct step (Skills in this case)
            3. Scrolls to the target section
            4. Adds a brief highlight effect
            5. Removes the query param to prevent re-scroll on refresh
          
          It renders nothing (returns null) and only runs effects.
          @see components/resume-builder/resume-builder-focus-handler.tsx
      ================================================================ */}
      <ResumeBuilderFocusHandler
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 max-w-7xl mx-auto" data-resume-step-content>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/career"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Career & Resume
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Resume Builder</span>
        </nav>

        {/* Day 38 Correction: When in tailoring mode, use TailoringWorkspace instead of showing banner + workspace */}
        {/* The TailoringWorkspace has its own compact top bar, so we don't show the banner here */}

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
                Build Your Federal Resume
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Create a USAJOBS-ready resume with guided sections.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Day 38: Resume Actions Bar (Save, Export, Focus view, Version selector) */}
              <ResumeActionsBar
                activeVersion={activeVersion}
                versions={resumeDocument.versions}
                saveStatus={saveStatus}
                onSaveVersion={handleSaveVersion}
                onExport={handleExport}
                onFocusView={handleFocusView}
                onSelectVersion={handleSelectVersion}
              />
              
              {/* ================================================================
                  Day 43: Review my resume button (primary PathAdvisor action)
                  ================================================================
                  Opens the Resume Review modal workspace where users can see their
                  resume alongside PathAdvisor suggestions. This is the primary
                  entry point for resume review with the guidance model.
                  
                  WHY THIS EXISTS (Day 43 - MODAL MODE, NOT NAVIGATION):
                  - Resume Review is a MODE, not a destination
                  - Must NOT navigate away from Resume Builder
                  - Must preserve scroll, cursor, and edit state
                  - Setting resumeReviewMode=true opens the modal overlay
                  - Resume Builder remains mounted underneath (dimmed)
              ================================================================ */}
              <Button
                variant="default"
                size="sm"
                onClick={function () {
                  setResumeReviewMode(true);
                }}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Sparkles className="h-4 w-4" />
                <span>Review my resume</span>
              </Button>
              
              {/* Open workspace button */}
              <Button
                variant="outline"
                size="sm"
                onClick={function () {
                  setIsWorkspaceOpen(true);
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span>Open workspace</span>
              </Button>
              {/* ============================================================
                  UNIFIED PRIVACY INDICATOR
                  ============================================================
                  Uses consistent terminology across all pages:
                  - "Privacy Mode: Hidden" when sensitive data is masked
                  - "Privacy Mode: Visible" when data is shown
                  This matches the Career page and PathAdvisor sidebar exactly.
              ============================================================ */}
              <Badge
                variant="outline"
                className={
                  'flex items-center gap-1.5 self-start ' +
                  (globalHide
                    ? 'border-accent/50 text-accent bg-accent/5'
                    : 'border-muted-foreground/30 text-muted-foreground')
                }
              >
                {globalHide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="text-xs">Privacy Mode: {globalHide ? 'Hidden' : 'Visible'}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Day 38 Continuation: Always show ResumeWorkspace first (editor is the hero) */}
        <div className="h-[calc(100vh-300px)] min-h-[600px] flex flex-col">
          <ResumeWorkspace
            initialResumeData={resumeData}
            activeTargetJob={activeTargetJob}
            isTailoringMode={isTailoringMode}
            onUpdateResumeData={function (data) {
              // Convert PageResumeData to store ResumeData format
              setResumeData({
                profile: {
                  firstName: data.profile.firstName,
                  lastName: data.profile.lastName,
                  email: data.profile.email,
                  phone: data.profile.phone,
                  address: data.profile.address,
                  city: data.profile.city,
                  state: data.profile.state,
                  zip: data.profile.zip,
                  citizenship: data.profile.citizenship,
                  veteranStatus: data.profile.veteranStatus,
                  securityClearance: data.profile.securityClearance,
                  currentAgency: data.profile.currentAgency || '',
                  currentSeries: data.profile.currentSeries || '',
                  currentGrade: data.profile.currentGrade || '',
                },
                targetRoles: data.targetRoles,
                workExperience: data.workExperience.map(function (exp) {
                  return {
                    id: exp.id,
                    employer: exp.employer,
                    title: exp.title,
                    series: exp.series || '',
                    grade: exp.grade || '',
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    current: exp.current,
                    hoursPerWeek: exp.hoursPerWeek,
                    salary: exp.salary || '',
                    supervisorName: exp.supervisorName || '',
                    supervisorPhone: exp.supervisorPhone || '',
                    duties: exp.duties,
                    accomplishments: exp.accomplishments,
                  };
                }),
                education: data.education.map(function (edu) {
                  return {
                    id: edu.id,
                    institution: edu.institution,
                    degree: edu.degree,
                    field: edu.field,
                    graduationDate: edu.graduationDate,
                    gpa: edu.gpa || '',
                    credits: edu.credits || '',
                  };
                }),
                skills: data.skills,
              });
            }}
            onClearTailoring={clearTailoringSession}
          />
        </div>

        {/* Day 38 Continuation: Show Resume Strength Panel below workspace (collapsed/compact) */}
        {!isTailoringMode && (
          <ResumeStrengthPanel data={resumeStrength} onCheckItemClick={handleStrengthCheckClick} compact />
        )}

        {/* Day 38 Overlay v1: Full-screen Workspace Overlay (supports both tailoring and general modes) */}
        <TailoringWorkspaceOverlay
          open={isWorkspaceOpen}
          onOpenChange={setIsWorkspaceOpen}
          initialResumeData={resumeData}
          activeTargetJob={activeTargetJob}
          onOpenJobPicker={function () {
            setIsJobPickerOpen(true);
          }}
          onUpdateResumeData={function (data) {
            // Convert PageResumeData to store ResumeData format
            setResumeData({
              profile: {
                firstName: data.profile.firstName,
                lastName: data.profile.lastName,
                email: data.profile.email,
                phone: data.profile.phone,
                address: data.profile.address,
                city: data.profile.city,
                state: data.profile.state,
                zip: data.profile.zip,
                citizenship: data.profile.citizenship,
                veteranStatus: data.profile.veteranStatus,
                securityClearance: data.profile.securityClearance,
                currentAgency: data.profile.currentAgency || '',
                currentSeries: data.profile.currentSeries || '',
                currentGrade: data.profile.currentGrade || '',
              },
              targetRoles: data.targetRoles,
              workExperience: data.workExperience.map(function (exp) {
                return {
                  id: exp.id,
                  employer: exp.employer,
                  title: exp.title,
                  series: exp.series || '',
                  grade: exp.grade || '',
                  startDate: exp.startDate,
                  endDate: exp.endDate,
                  current: exp.current,
                  hoursPerWeek: exp.hoursPerWeek,
                  salary: exp.salary || '',
                  supervisorName: exp.supervisorName || '',
                  supervisorPhone: exp.supervisorPhone || '',
                  duties: exp.duties,
                  accomplishments: exp.accomplishments,
                };
              }),
              education: data.education.map(function (edu) {
                return {
                  id: edu.id,
                  institution: edu.institution,
                  degree: edu.degree,
                  field: edu.field,
                  graduationDate: edu.graduationDate,
                  gpa: edu.gpa || '',
                  credits: edu.credits || '',
                };
              }),
              skills: data.skills,
            });
          }}
          onClearTailoring={clearTailoringSession}
          onReviewResume={function () {
            // Day 43: Resume Review is a MODE, not navigation
            // Opens the Resume Review modal while keeping Resume Builder mounted
            setResumeReviewMode(true);
          }}
        />

        {/* Day 38 Continuation: Job Picker Modal */}
        <JobPickerModal
          open={isJobPickerOpen}
          onOpenChange={setIsJobPickerOpen}
          onJobSelected={function () {
            // The overlay will open automatically when isTailoringMode becomes true
            // (handled by useEffect that watches isTailoringMode)
          }}
        />

        {/* Day 38 Correction: Job Details Slide-Over is now handled inside TailoringWorkspace */}
        {/* Only show here if NOT in tailoring mode (for backward compatibility) */}
        {!isTailoringMode && activeTargetJob && (
          <JobDetailsSlideOver
            open={isJobDetailsOpen}
            onOpenChange={setIsJobDetailsOpen}
            job={{
              // Canonical fields (Day 12)
              id: activeTargetJob.jobId || '0',
              title: activeTargetJob.title,
              seriesCode: activeTargetJob.series,
              gradeLevel: activeTargetJob.grade,
              locationDisplay: activeTargetJob.location,
              organizationName: activeTargetJob.agency,
              employmentType: 'Full-time',
              estimatedTotalComp: 120000,
              matchPercent: activeTargetJob.matchPercent || 0,
            }}
            showTailorCTA={false}
          />
        )}
        
        {/* Day 38: Export Modal */}
        <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
          <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Export Resume</DialogTitle>
              <DialogDescription>
                Preview and export your resume for USAJOBS.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4">
              <ReviewExportStep
                resumeData={currentResumeDataForPreview}
                resumeStrength={resumeStrength}
                onAskPathAdvisor={handleAskPathAdvisorForExport}
              />
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Day 38: Focus View Modal */}
        <Dialog open={isFocusViewOpen} onOpenChange={setIsFocusViewOpen}>
          <DialogContent 
            className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col [&>button.absolute]:hidden"
            showCloseButton={false}
          >
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle>Focus View</DialogTitle>
                  <DialogDescription>
                    Full preview of your resume. Switch between USAJOBS and Traditional formats.
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={function () {
                    setIsFocusViewOpen(false);
                  }}
                  className="text-xs gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exit Focus</span>
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4">
              {activeView ? (
                <ResumePreviewPane
                  resumeData={currentResumeDataForPreview}
                  activeView={activeView}
                  isTailoringMode={false}
                />
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  Select a view to see preview
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Day 38: Save Version Modal */}
        <Dialog open={isSaveVersionModalOpen} onOpenChange={setIsSaveVersionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Version</DialogTitle>
              <DialogDescription>
                Enter a name for this resume version. This will create a snapshot of your current resume.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="version-name">Version name</Label>
              <Input
                id="version-name"
                value={saveVersionName}
                onChange={function (e) {
                  setSaveVersionName(e.target.value);
                }}
                placeholder="e.g., Version 2"
                className="mt-2"
                onKeyDown={function (e) {
                  if (e.key === 'Enter') {
                    handleCreateVersion();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={function () {
                  setIsSaveVersionModalOpen(false);
                  setSaveVersionName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateVersion}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* ================================================================
            Day 43: Resume Review Modal (MODE, not navigation)
            ================================================================
            Full-screen modal overlay for collaborative resume review.
            
            KEY PRINCIPLES:
            1. Resume Review is a MODE, not a destination
            2. Resume Builder remains mounted underneath (preserving state)
            3. No URL change, no scroll reset, no unmounting editor
            4. Resume remains EDITABLE at all times
            5. PathAdvisor provides GUIDANCE, not silent rewrites
        ================================================================ */}
        <ResumeReviewModal
          open={resumeReviewMode}
          onOpenChange={setResumeReviewMode}
          resumeData={localResumeData}
          onUpdateResumeData={function (data) {
            setResumeData({
              profile: {
                firstName: data.profile.firstName,
                lastName: data.profile.lastName,
                email: data.profile.email,
                phone: data.profile.phone,
                address: data.profile.address,
                city: data.profile.city,
                state: data.profile.state,
                zip: data.profile.zip,
                citizenship: data.profile.citizenship,
                veteranStatus: data.profile.veteranStatus,
                securityClearance: data.profile.securityClearance,
                currentAgency: data.profile.currentAgency || '',
                currentSeries: data.profile.currentSeries || '',
                currentGrade: data.profile.currentGrade || '',
              },
              targetRoles: data.targetRoles,
              workExperience: data.workExperience.map(function (exp) {
                return {
                  id: exp.id,
                  employer: exp.employer,
                  title: exp.title,
                  series: exp.series || '',
                  grade: exp.grade || '',
                  startDate: exp.startDate,
                  endDate: exp.endDate,
                  current: exp.current,
                  hoursPerWeek: exp.hoursPerWeek,
                  salary: exp.salary || '',
                  supervisorName: exp.supervisorName || '',
                  supervisorPhone: exp.supervisorPhone || '',
                  duties: exp.duties,
                  accomplishments: exp.accomplishments,
                };
              }),
              education: data.education.map(function (edu) {
                return {
                  id: edu.id,
                  institution: edu.institution,
                  degree: edu.degree,
                  field: edu.field,
                  graduationDate: edu.graduationDate,
                  gpa: edu.gpa || '',
                  credits: edu.credits || '',
                };
              }),
              skills: data.skills,
            });
          }}
        />
      </div>
    </PageShell>
  );
}
