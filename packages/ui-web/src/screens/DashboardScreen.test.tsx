import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardScreen } from './DashboardScreen';

describe('DashboardScreen', function () {
  it('renders the dashboard heading', function () {
    render(<DashboardScreen />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
  });

  it('renders at least three key dashboard sections', function () {
    render(<DashboardScreen />);
    expect(screen.getAllByRole('heading', { level: 2, name: 'Daily Path Brief' }).length > 0).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2, name: 'Upcoming Milestones' }).length > 0).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2, name: 'Recent Activity' }).length > 0).toBeTruthy();
  });
});
