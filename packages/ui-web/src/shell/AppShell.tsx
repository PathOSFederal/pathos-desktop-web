'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useAppShellAdapter } from './AppShellAdapterProvider';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { PathAdvisorRail } from './PathAdvisorRail';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell(props: AppShellProps) {
  const children = props.children;
  const adapter = useAppShellAdapter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  if (!adapter.hasAcceptedGlobalDisclaimer) {
    return <>{adapter.renderDisclaimer()}</>;
  }

  let dock = adapter.dock;
  if (dock !== 'left') {
    dock = 'right';
  }

  const wrappedMain = adapter.wrapMainContent(children);
  const sidebar = adapter.renderSidebar({
    onNavigate: function () {
      setMobileNavOpen(false);
    },
  });
  const pathAdvisor = (
    <PathAdvisorRail
      onSendMessage={adapter.pathAdvisorRail.onSendMessage}
      onClearConversation={adapter.pathAdvisorRail.onClearConversation}
    />
  );

  useEffect(
    function registerShortcutHandler() {
      const registerShortcutOpen = adapter.registerShortcutOpen;
      if (!registerShortcutOpen) {
        return;
      }
      const cleanup = registerShortcutOpen(function () {
        setShortcutsOpen(true);
      });
      return cleanup;
    },
    [adapter]
  );

  return (
    <div className="pathos-shell" data-app-root="true">
      {adapter.renderRootOverlay()}
      {adapter.renderTopBar({
        onOpenMobileNav: function () {
          setMobileNavOpen(true);
        },
        onGoHome: function () {
          adapter.navigation.navigate('/dashboard');
        },
      })}

      <div className="pathos-shell-banner">{adapter.renderBanner()}</div>

      {mobileNavOpen && (
        <div className="pathos-shell-mobile-backdrop">
          <div className="pathos-shell-mobile-panel">
            <div className="pathos-shell-mobile-header">
              <button
                type="button"
                className="pathos-shell-mobile-close"
                onClick={function () {
                  setMobileNavOpen(false);
                }}
              >
                Close
              </button>
            </div>
            <div className="pathos-shell-mobile-content">{sidebar}</div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pathos-shell-shortcut-hint"
        onClick={function () {
          setShortcutsOpen(true);
        }}
      >
        Press ? for keyboard shortcuts
      </button>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={function () {
          setShortcutsOpen(false);
        }}
      />

      {dock === 'left' ? (
        <div className="pathos-shell-layout">
          {!adapter.hideSidebar && <div className="pathos-shell-sidebar">{sidebar}</div>}
          {!adapter.hidePathAdvisor && <aside className="pathos-shell-advisor left">{pathAdvisor}</aside>}
          <main className="pathos-shell-main">{wrappedMain}</main>
        </div>
      ) : (
        <div className="pathos-shell-layout">
          {!adapter.hideSidebar && <div className="pathos-shell-sidebar">{sidebar}</div>}
          <main className="pathos-shell-main">{wrappedMain}</main>
          {!adapter.hidePathAdvisor && <aside className="pathos-shell-advisor right">{pathAdvisor}</aside>}
        </div>
      )}
    </div>
  );
}
