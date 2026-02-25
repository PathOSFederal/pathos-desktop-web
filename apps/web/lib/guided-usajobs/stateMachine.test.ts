/**
 * ============================================================================
 * GUIDED USAJOBS STATE MACHINE TESTS (Day 44)
 * ============================================================================
 *
 * Verifies explicit state transitions for Guided USAJOBS click-to-explain.
 */

import { describe, it, expect } from 'vitest';
import { getGuidedUsaJobsNextState } from './stateMachine';

describe('getGuidedUsaJobsNextState', function () {
  it('should move from IDLE to ARMED on ARM', function () {
    const result = getGuidedUsaJobsNextState('IDLE', 'ARM');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('ARMED');
  });

  it('should move from ARMED to REGION_SELECTED on SELECT_REGION', function () {
    const result = getGuidedUsaJobsNextState('ARMED', 'SELECT_REGION');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('REGION_SELECTED');
  });

  it('should move from REGION_SELECTED to SCREENSHOT_CAPTURED on CAPTURE_SCREENSHOT', function () {
    const result = getGuidedUsaJobsNextState('REGION_SELECTED', 'CAPTURE_SCREENSHOT');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('SCREENSHOT_CAPTURED');
  });

  it('should move from SCREENSHOT_CAPTURED to ANALYZING on START_ANALYSIS', function () {
    const result = getGuidedUsaJobsNextState('SCREENSHOT_CAPTURED', 'START_ANALYSIS');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('ANALYZING');
  });

  it('should move from ANALYZING to RESPONDING on RENDER_RESPONSE', function () {
    const result = getGuidedUsaJobsNextState('ANALYZING', 'RENDER_RESPONSE');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('RESPONDING');
  });

  it('should move from RESPONDING to COMPLETE on COMPLETE', function () {
    const result = getGuidedUsaJobsNextState('RESPONDING', 'COMPLETE');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('COMPLETE');
  });

  it('should allow re-arming from COMPLETE', function () {
    const result = getGuidedUsaJobsNextState('COMPLETE', 'ARM');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('ARMED');
  });

  it('should always return to IDLE on DISARM', function () {
    const result = getGuidedUsaJobsNextState('ANALYZING', 'DISARM');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('IDLE');
  });

  it('should reject invalid transitions', function () {
    const result = getGuidedUsaJobsNextState('IDLE', 'SELECT_REGION');
    expect(result.allowed).toBe(false);
    expect(result.nextState).toBe('IDLE');
  });
});
