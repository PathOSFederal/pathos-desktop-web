'use client';

import { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrivacy } from '@/contexts/privacy-context';
import { useAdvisorContext } from '@/contexts/advisor-context';
import { RetirementSnapshotCard } from '@/components/retirement/retirement-snapshot-card';
import { TspProjectionCard } from '@/components/retirement/tsp-projection-card';
import { FersDetailsCard } from '@/components/retirement/fers-details-card';
import { RetirementScenariosCard } from '@/components/retirement/retirement-scenarios-card';

export default function RetirementPage() {
  const { globalHide } = usePrivacy();
  /**
   * setScreenInfo is the correct API for updating the PathAdvisor's screen context.
   * We use this instead of setContext because screenName and screenPurpose are
   * managed separately in AdvisorContext (not part of AdvisorContextData).
   */
  const { setScreenInfo } = useAdvisorContext();

  useEffect(function updateScreenContextOnLoad() {
    /**
     * Update PathAdvisor context when page loads.
     * This tells the advisor what screen the user is viewing so it can
     * provide relevant, context-aware assistance.
     */
    setScreenInfo(
      'Retirement & Long-Term Outlook',
      'help the user understand their long-term retirement outlook including TSP projections, FERS pension estimates, and retirement scenario planning'
    );
  }, [setScreenInfo]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Retirement & Long-Term Outlook
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              See how your TSP, FERS pension, and benefits translate into your future retirement
              income. Part of your PathOS career intelligence dashboard.
            </p>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 ${
              globalHide
                ? 'border-accent/50 text-accent'
                : 'border-muted-foreground/30 text-muted-foreground'
            }`}
          >
            {globalHide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="text-xs">Privacy: {globalHide ? 'Active' : 'Off'}</span>
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Main Retirement Metrics */}
        <div className="space-y-6">
          <RetirementSnapshotCard />
          <FersDetailsCard />
        </div>

        {/* Right Column: Scenario Builder & TSP */}
        <div className="space-y-6">
          <TspProjectionCard />
          <RetirementScenariosCard />
        </div>
      </div>

      {/* PathAdvisor Quick Actions */}
      <div className="p-4 rounded-lg border border-border bg-muted/20">
        <p className="text-sm font-medium text-foreground mb-3">Ask PathAdvisor</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: Explain my retirement outlook');
            }}
          >
            Explain my retirement outlook
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: How does FERS pension work?');
            }}
          >
            How does FERS pension work?
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: Should I increase my TSP contribution?');
            }}
          >
            Should I increase my TSP contribution?
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: When can I retire with full benefits?');
            }}
          >
            When can I retire with full benefits?
          </Button>
        </div>
      </div>
    </div>
  );
}
