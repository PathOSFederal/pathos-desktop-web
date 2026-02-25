import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CareerScreen } from './CareerScreen';

describe('CareerScreen', function () {
  it('renders the career heading', function () {
    render(<CareerScreen />);
    expect(screen.getByRole('heading', { name: 'Career' })).toBeTruthy();
  });

  it('renders key career sections', function () {
    render(<CareerScreen />);
    expect(screen.getAllByText('Target roles').length > 0).toBeTruthy();
    expect(screen.getAllByText('Saved searches').length > 0).toBeTruthy();
    expect(screen.getAllByText('Job alerts').length > 0).toBeTruthy();
    expect(screen.getAllByText('Resume builder').length > 0).toBeTruthy();
  });

  it('renders section headers as level two headings', function () {
    render(<CareerScreen />);
    expect(screen.getAllByRole('heading', { level: 2, name: 'Target roles' }).length > 0).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2, name: 'Saved searches' }).length > 0).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2, name: 'Job alerts' }).length > 0).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2, name: 'Resume builder' }).length > 0).toBeTruthy();
  });
});
