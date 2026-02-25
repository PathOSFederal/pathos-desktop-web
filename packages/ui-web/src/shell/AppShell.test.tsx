import type React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';
import { AppShellAdapterProvider } from './AppShellAdapterProvider';

describe('AppShell', function () {
  it('navigates home when top bar title is clicked', function () {
    const navigate = vi.fn();
    const value = {
      hasAcceptedGlobalDisclaimer: true,
      dock: 'right' as const,
      hideSidebar: false,
      hidePathAdvisor: false,
      navigation: {
        currentPath: '/career',
        navigate: navigate,
      },
      registerShortcutOpen: null,
      pathAdvisorRail: {
        onSendMessage: function () {},
        onClearConversation: function () {},
      },
      renderDisclaimer: function () {
        return null;
      },
      renderRootOverlay: function () {
        return null;
      },
      renderTopBar: function (options: { onOpenMobileNav: () => void; onGoHome: () => void }) {
        return (
          <button type="button" onClick={options.onGoHome}>
            PathOS
          </button>
        );
      },
      renderBanner: function () {
        return null;
      },
      renderSidebar: function () {
        return <div>sidebar</div>;
      },
      wrapMainContent: function (children: React.ReactNode) {
        return children;
      },
    };

    render(
      <AppShellAdapterProvider value={value}>
        <AppShell>
          <div>content</div>
        </AppShell>
      </AppShellAdapterProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'PathOS' }));
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('opens shortcuts modal from hint button', function () {
    const value = {
      hasAcceptedGlobalDisclaimer: true,
      dock: 'right' as const,
      hideSidebar: false,
      hidePathAdvisor: false,
      navigation: {
        currentPath: '/dashboard',
        navigate: function () {},
      },
      registerShortcutOpen: null,
      pathAdvisorRail: {
        onSendMessage: function () {},
        onClearConversation: function () {},
      },
      renderDisclaimer: function () {
        return null;
      },
      renderRootOverlay: function () {
        return null;
      },
      renderTopBar: function () {
        return <div>top</div>;
      },
      renderBanner: function () {
        return null;
      },
      renderSidebar: function () {
        return <div>sidebar</div>;
      },
      wrapMainContent: function (children: React.ReactNode) {
        return children;
      },
    };

    render(
      <AppShellAdapterProvider value={value}>
        <AppShell>
          <div>content</div>
        </AppShell>
      </AppShellAdapterProvider>
    );

    const shortcutHints = screen.getAllByText('Press ? for keyboard shortcuts');
    fireEvent.click(shortcutHints[0]);
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();
  });
});
