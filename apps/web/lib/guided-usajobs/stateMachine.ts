/**
 * ============================================================================
 * GUIDED USAJOBS INTERACTION STATE MACHINE (Day 44)
 * ============================================================================
 *
 * FILE PURPOSE:
 * Defines the explicit state machine for Guided USAJOBS Mode. This is the
 * canonical map of allowed transitions for "Ask PathAdvisor" click-to-explain.
 *
 * WHY THIS EXISTS:
 * The feature requires an explicit, debuggable interaction lifecycle:
 * IDLE → ARMED → REGION_SELECTED → SCREENSHOT_CAPTURED → ANALYZING →
 * RESPONDING → COMPLETE.
 *
 * This module provides:
 * - Explicit state and event definitions
 * - A pure transition function (easy to unit test)
 * - Human-readable reasons for debugging and logs
 *
 * @version Day 44 - Guided USAJOBS Click-to-Explain v1
 * ============================================================================
 */

/**
 * All explicit interaction states for Guided USAJOBS Mode.
 */
export type GuidedUsaJobsInteractionState =
  | 'IDLE'
  | 'ARMED'
  | 'REGION_SELECTED'
  | 'SCREENSHOT_CAPTURED'
  | 'ANALYZING'
  | 'RESPONDING'
  | 'COMPLETE';

/**
 * State transition events for Guided USAJOBS Mode.
 */
export type GuidedUsaJobsEvent =
  | 'ARM'
  | 'DISARM'
  | 'SELECT_REGION'
  | 'CAPTURE_SCREENSHOT'
  | 'START_ANALYSIS'
  | 'RENDER_RESPONSE'
  | 'COMPLETE'
  | 'RESET';

/**
 * Transition result with debuggable details.
 */
export interface GuidedUsaJobsTransitionResult {
  /** Whether the transition is valid */
  allowed: boolean;
  /** The next state (or current state if not allowed) */
  nextState: GuidedUsaJobsInteractionState;
  /** Human-readable reason for the transition decision */
  reason: string;
}

/**
 * Get the next interaction state for Guided USAJOBS.
 *
 * WHY THIS IS PURE:
 * This is a pure function with no side effects so unit tests can verify all
 * transitions without mocking stores or UI.
 */
export function getGuidedUsaJobsNextState(
  currentState: GuidedUsaJobsInteractionState,
  event: GuidedUsaJobsEvent,
): GuidedUsaJobsTransitionResult {
  // ---------------------------------------------------------------------------
  // Global overrides (valid from any state)
  // ---------------------------------------------------------------------------
  if (event === 'RESET') {
    return {
      allowed: true,
      nextState: 'IDLE',
      reason: 'Reset returns the interaction to IDLE.',
    };
  }

  if (event === 'DISARM') {
    return {
      allowed: true,
      nextState: 'IDLE',
      reason: 'Disarm returns the interaction to IDLE.',
    };
  }

  // ---------------------------------------------------------------------------
  // State-specific transitions
  // ---------------------------------------------------------------------------
  if (currentState === 'IDLE') {
    if (event === 'ARM') {
      return {
        allowed: true,
        nextState: 'ARMED',
        reason: 'Ask PathAdvisor enabled, ready for selection.',
      };
    }
  }

  if (currentState === 'ARMED') {
    if (event === 'SELECT_REGION') {
      return {
        allowed: true,
        nextState: 'REGION_SELECTED',
        reason: 'User selected a region to explain.',
      };
    }
    if (event === 'ARM') {
      return {
        allowed: true,
        nextState: 'ARMED',
        reason: 'Already armed; no state change.',
      };
    }
  }

  if (currentState === 'REGION_SELECTED') {
    if (event === 'CAPTURE_SCREENSHOT') {
      return {
        allowed: true,
        nextState: 'SCREENSHOT_CAPTURED',
        reason: 'Local screenshot captured for analysis.',
      };
    }
  }

  if (currentState === 'SCREENSHOT_CAPTURED') {
    if (event === 'START_ANALYSIS') {
      return {
        allowed: true,
        nextState: 'ANALYZING',
        reason: 'Screenshot sent to PathAdvisor context.',
      };
    }
  }

  if (currentState === 'ANALYZING') {
    if (event === 'RENDER_RESPONSE') {
      return {
        allowed: true,
        nextState: 'RESPONDING',
        reason: 'Guidance prepared for display.',
      };
    }
  }

  if (currentState === 'RESPONDING') {
    if (event === 'COMPLETE') {
      return {
        allowed: true,
        nextState: 'COMPLETE',
        reason: 'Response rendered; session complete.',
      };
    }
  }

  if (currentState === 'COMPLETE') {
    if (event === 'ARM') {
      return {
        allowed: true,
        nextState: 'ARMED',
        reason: 'User re-armed Ask PathAdvisor.',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Default: transition is not allowed
  // ---------------------------------------------------------------------------
  return {
    allowed: false,
    nextState: currentState,
    reason: 'Transition not allowed from current state.',
  };
}
