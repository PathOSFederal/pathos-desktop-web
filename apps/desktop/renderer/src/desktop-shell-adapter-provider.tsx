import type React from 'react';
import { AppShellAdapterProvider } from '@pathos/ui-web';
import type { AppShellAdapterValue } from '@pathos/ui-web';
import { SharedBanner } from '@pathos/ui-web';
import { usePreferencesController } from '@pathos/ui-web';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDesktopNavActive } from './navigation/nav-state';

interface DesktopShellAdapterProviderProps {
  children: React.ReactNode;
}

interface DesktopNavItem {
  label: string;
  path: string;
}

const desktopNavItems: DesktopNavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Career', path: '/career' },
  { label: 'Settings', path: '/settings' },
];

function DesktopTopBar(props: { onOpenMobileNav: () => void; onGoHome: () => void; currentPath: string }) {
  const onOpenMobileNav = props.onOpenMobileNav;
  const onGoHome = props.onGoHome;
  const currentPath = props.currentPath;
  let routeLabel = 'Dashboard';
  if (currentPath === '/career') {
    routeLabel = 'Career';
  }
  if (currentPath === '/settings') {
    routeLabel = 'Settings';
  }

  return (
    <header className="desktop-shell-topbar">
      <div className="desktop-shell-brand">
        <button
          type="button"
          className="desktop-shell-menu-button"
          onClick={function () {
            onOpenMobileNav();
          }}
        >
          Menu
        </button>
        <div className="desktop-shell-logo">P</div>
        <button type="button" className="desktop-shell-home-button" onClick={onGoHome}>
          <strong>PathOS</strong>
        </button>
      </div>
      <div className="desktop-shell-topbar-label">Desktop · {routeLabel}</div>
    </header>
  );
}

function DesktopSidebar(props: {
  onNavigate: () => void;
  currentPath: string;
  onNavigateTo: (path: string) => void;
}) {
  const onNavigate = props.onNavigate;
  const currentPath = props.currentPath;
  const onNavigateTo = props.onNavigateTo;

  return (
    <aside className="desktop-shell-sidebar">
      <div className="desktop-shell-sidebar-title">Navigation</div>
      {desktopNavItems.map(function (item) {
        const isActive = isDesktopNavActive(currentPath, item.path);
        let itemClassName = 'desktop-shell-sidebar-item';
        if (isActive) {
          itemClassName = itemClassName + ' active';
        }

        return (
          <button
            key={item.path}
            type="button"
            className={itemClassName}
            onClick={function () {
              onNavigateTo(item.path);
              onNavigate();
            }}
          >
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}

export function DesktopShellAdapterProvider(props: DesktopShellAdapterProviderProps) {
  const children = props.children;
  const navigate = useNavigate();
  const location = useLocation();
  const controller = usePreferencesController();
  const preferences = controller.preferences;

  const navigateToPath = function (path: string) {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const value: AppShellAdapterValue = {
    hasAcceptedGlobalDisclaimer: true,
    dock: 'right',
    hideSidebar: false,
    hidePathAdvisor: !preferences.showPathAdvisorPanel,
    navigation: {
      currentPath: location.pathname,
      navigate: navigateToPath,
    },
    registerShortcutOpen: function (openModal) {
      const onKeyDown = function (event: KeyboardEvent) {
        if (event.key === '?') {
          openModal();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return function cleanup() {
        window.removeEventListener('keydown', onKeyDown);
      };
    },
    pathAdvisorRail: {
      onSendMessage: function (_text: string) {
        console.log('[Desktop] PathAdvisor send placeholder');
      },
      onClearConversation: function () {
        console.log('[Desktop] PathAdvisor clear placeholder');
      },
    },
    renderDisclaimer: function () {
      return null;
    },
    renderRootOverlay: function () {
      return null;
    },
    renderTopBar: function (options) {
      return (
        <DesktopTopBar
          onOpenMobileNav={options.onOpenMobileNav}
          onGoHome={options.onGoHome}
          currentPath={location.pathname}
        />
      );
    },
    renderBanner: function () {
      return <SharedBanner />;
    },
    renderSidebar: function (options) {
      return (
        <DesktopSidebar
          onNavigate={options.onNavigate}
          currentPath={location.pathname}
          onNavigateTo={navigateToPath}
        />
      );
    },
    wrapMainContent: function (innerChildren) {
      return innerChildren;
    },
  };

  return <AppShellAdapterProvider value={value}>{children}</AppShellAdapterProvider>;
}
