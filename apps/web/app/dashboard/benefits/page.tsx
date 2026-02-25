'use client';

import { useEffect, useState } from 'react';
import { Shield, TrendingUp, Calendar, DollarSign, Eye, EyeOff, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrivacy } from '@/contexts/privacy-context';
import { useAdvisorContext } from '@/contexts/advisor-context';
import { BenefitsSummaryCard } from '@/components/benefits/benefits-summary-card';
import { FehbInsightsCard } from '@/components/benefits/fehb-insights-card';
import { TspSnapshotCard } from '@/components/benefits/tsp-snapshot-card';
import { LeaveBenefitsCard } from '@/components/benefits/leave-benefits-card';

export default function BenefitsOverviewPage() {
  const { globalHide } = usePrivacy();
  /**
   * setScreenInfo is the correct API for updating the PathAdvisor's screen context.
   * We use this instead of setContext because screenName and screenPurpose are
   * managed separately in AdvisorContext (not part of AdvisorContextData).
   */
  const { setScreenInfo } = useAdvisorContext();

  // FEHB priority selection for plan comparison
  const [fehbPriority, setFehbPriority] = useState('balanced');

  // Mock benefits values
  const benefitsData = {
    fehbValue: '$12,400',
    tspValue: '$26,055',
    leaveValue: '$27,312',
    totalValue: '$65,767',
  };

  useEffect(function updateScreenContextOnLoad() {
    /**
     * Update PathAdvisor context when page loads.
     * This tells the advisor what screen the user is viewing so it can
     * provide relevant, context-aware assistance.
     */
    setScreenInfo(
      'Benefits Overview',
      'help the user understand their federal benefits package including FEHB, TSP, leave, and total benefits value'
    );
  }, [setScreenInfo]);

  useEffect(function updateContextOnPriorityChange() {
    /**
     * Update PathAdvisor context when FEHB priority changes.
     * This gives the advisor additional context about user's current focus.
     */
    if (fehbPriority !== 'balanced') {
      const purpose = fehbPriority === 'lower-premium'
        ? 'User is reviewing FEHB options prioritizing lower premiums'
        : 'User is reviewing FEHB options prioritizing lower risk';
      setScreenInfo('Benefits Overview', purpose);
    }
  }, [fehbPriority, setScreenInfo]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Benefits Overview</h1>
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Briefcase className="w-3 h-3 mr-1" />
                Current Federal Employee
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              See the estimated value of your federal benefits and explore how health, retirement,
              and leave decisions affect your total package.
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

      {/* Benefits Summary Row */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Benefits Summary</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <BenefitsSummaryCard
            cardKey="benefits.fehbInsights"
            title="FEHB Health Coverage"
            value={benefitsData.fehbValue}
            subtitle="Estimated annual value of your federal health insurance"
            tooltipContent="This represents the total annual value of your FEHB coverage, including the government's contribution (approximately 72% of premiums) and your employee share."
            icon={<Shield className="w-4 h-4 text-accent" />}
          />
          <BenefitsSummaryCard
            cardKey="benefits.tspSnapshot"
            title="TSP Retirement Contributions"
            value={benefitsData.tspValue}
            subtitle="Estimated annual retirement savings through TSP"
            tooltipContent="Combined annual contribution including your employee contribution and the federal government's matching contribution (up to 5% of salary)."
            icon={<TrendingUp className="w-4 h-4 text-accent" />}
          />
          <BenefitsSummaryCard
            cardKey="benefits.leaveBenefits"
            title="Paid Leave Value"
            value={benefitsData.leaveValue}
            subtitle="Approximate annual value of your leave time"
            tooltipContent="This estimate converts your annual leave, sick leave, and federal holidays into a dollar value based on your hourly rate."
            icon={<Calendar className="w-4 h-4 text-accent" />}
          />
          <BenefitsSummaryCard
            cardKey="benefits.summary"
            title="Total Benefits Value"
            value={benefitsData.totalValue}
            subtitle="Estimated annual value of your federal benefits package"
            tooltipContent="The combined estimated value of your FEHB, TSP contributions, and paid leave. This represents additional compensation beyond your base salary. Actual values may vary."
            icon={<DollarSign className="w-4 h-4 text-accent" />}
            highlighted
          />
        </div>
      </div>

      {/* FEHB Insights & Plan Exploration */}
      <FehbInsightsCard
        priority={fehbPriority}
        onPriorityChange={setFehbPriority}
      />

      {/* TSP & Retirement Snapshot */}
      <TspSnapshotCard />

      {/* Leave & Other Benefits */}
      <LeaveBenefitsCard />

      {/* PathAdvisor Quick Actions (visible at bottom for context) */}
      <div className="p-4 rounded-lg border border-border bg-muted/20">
        <p className="text-sm font-medium text-foreground mb-3">Ask PathAdvisor</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: Explain my benefits value');
            }}
          >
            Explain my benefits value
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: Help me compare FEHB options');
            }}
          >
            Help me compare FEHB options
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent hover:bg-accent/10"
            onClick={() => {
              console.log('PathAdvisor prompt: How much should I contribute to TSP?');
            }}
          >
            How much should I contribute to TSP?
          </Button>
        </div>
      </div>
    </div>
  );
}
