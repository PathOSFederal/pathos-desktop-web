'use client';

import type React from 'react';
import { Menu } from 'lucide-react';
import { AppShellAdapterProvider } from '@pathos/ui-web';
import type { AppShellAdapterValue } from '@pathos/ui-web';
import { SharedBanner } from '@pathos/ui-web';
import { usePreferencesController } from '@pathos/ui-web';
import { PathOSTopBar } from '@/components/path-os-top-bar';
import { PathOSSidebar } from '@/components/path-os-sidebar';
import { OnboardingDisclaimerStep } from '@/components/onboarding-disclaimer-step';
import { RouteTransition } from '@/components/layout/RouteTransition';
import { GuidedTourOverlay } from '@/components/tour/GuidedTourOverlay';
import { useUserPreferencesStore } from '@/store/userPreferencesStore';
import { useProfileStore } from '@/store/profileStore';
import { useResumeBuilderStore } from '@/store/resumeBuilderStore';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useAnchorRouteReset } from '@/hooks/use-anchor-route-reset';

interface WebAppShellAdapterProviderProps {
  children: React.ReactNode;
}

export function WebAppShellAdapterProvider(props: WebAppShellAdapterProviderProps) {
  const children = props.children;
  const router = useRouter();
  const preferencesController = usePreferencesController();

  const hasAcceptedGlobalDisclaimer = useUserPreferencesStore(function (state) {
    return state.hasAcceptedGlobalDisclaimer;
  });

  const profile = useProfileStore(function (state) {
    return state.profile;
  });

  const pathname = usePathname();
  const isDashboardPage = pathname === '/dashboard';
  const isGuidedUsaJobs = pathname === '/dashboard/usajobs';
  const isBenefitsWorkspace = pathname === '/explore/benefits/workspace';

  const isTailoringMode = useResumeBuilderStore(function (state) {
    return state.isTailoringMode;
  });

  useAnchorRouteReset();

  const shouldHidePathAdvisor =
    isDashboardPage || isTailoringMode || isGuidedUsaJobs || !preferencesController.preferences.showPathAdvisorPanel;
  const shouldHideSidebar = isBenefitsWorkspace;

  const storedDock = profile.preferences.pathAdvisorDock;
  let dock: 'left' | 'right' = 'right';
  if (storedDock === 'left') {
    dock = 'left';
  }

  const value: AppShellAdapterValue = {
    hasAcceptedGlobalDisclaimer: hasAcceptedGlobalDisclaimer,
    dock: dock,
    hideSidebar: shouldHideSidebar,
    hidePathAdvisor: shouldHidePathAdvisor,
    navigation: {
      currentPath: pathname,
      navigate: function (path: string) {
        router.push(path);
      },
    },
    registerShortcutOpen: null,
    pathAdvisorRail: {
      onSendMessage: function () {},
      onClearConversation: function () {},
    },
    renderDisclaimer: function () {
      return <OnboardingDisclaimerStep />;
    },
    renderRootOverlay: function () {
      return <GuidedTourOverlay />;
    },
    renderTopBar: function (options) {
      return (
        <PathOSTopBar onGoHome={options.onGoHome}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={function () {
              options.onOpenMobileNav();
            }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </PathOSTopBar>
      );
    },
    renderBanner: function () {
      return <SharedBanner />;
    },
    renderSidebar: function (options) {
      return <PathOSSidebar onNavigate={options.onNavigate} />;
    },
    wrapMainContent: function (innerChildren) {
      return <RouteTransition>{innerChildren}</RouteTransition>;
    },
  };

  return <AppShellAdapterProvider value={value}>{children}</AppShellAdapterProvider>;
}
