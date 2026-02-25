import type React from 'react';
import type { NavigationAdapter } from '@pathos/adapters';

export type AppShellDock = 'left' | 'right';

export interface PathAdvisorRailAdapterValue {
  onSendMessage: (text: string) => void;
  onClearConversation: () => void;
}

export interface AppShellAdapterValue {
  hasAcceptedGlobalDisclaimer: boolean;
  dock: AppShellDock;
  hideSidebar: boolean;
  hidePathAdvisor: boolean;
  navigation: NavigationAdapter;
  registerShortcutOpen?: ((openModal: () => void) => () => void) | null;
  pathAdvisorRail: PathAdvisorRailAdapterValue;
  renderDisclaimer: () => React.ReactNode;
  renderRootOverlay: () => React.ReactNode;
  renderTopBar: (options: { onOpenMobileNav: () => void; onGoHome: () => void }) => React.ReactNode;
  renderBanner: () => React.ReactNode;
  renderSidebar: (options: { onNavigate: () => void }) => React.ReactNode;
  wrapMainContent: (children: React.ReactNode) => React.ReactNode;
}
