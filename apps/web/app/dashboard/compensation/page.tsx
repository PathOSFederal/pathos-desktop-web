'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdvisorContext } from '@/contexts/advisor-context';
import { usePrivacy } from '@/contexts/privacy-context';
import { CompensationSnapshot } from '@/components/compensation/compensation-snapshot';
import { PayBenefitsBreakdown } from '@/components/compensation/pay-benefits-breakdown';
import { CompensationScenarioPanel } from '@/components/compensation/compensation-scenario-panel';

// Mock profile data (would come from global state in real app)
const mockProfile = {
  grade: 'GS-12',
  step: 4,
  series: '0343',
  locality: 'DC',
  localityLabel: 'Washington-Baltimore-Arlington',
};

// Mock pay calculations
const GS_BASE_PAY: Record<string, Record<number, number>> = {
  'GS-12': { 4: 87308 },
};
const LOCALITY_RATES: Record<string, number> = { DC: 0.3294 };

export default function CompensationPage() {
  const screenName = 'Compensation Overview';
  /**
   * setScreenInfo is the correct API for updating the PathAdvisor's screen context.
   * We use this instead of setContext because screenName and screenPurpose are
   * managed separately in AdvisorContext (not part of AdvisorContextData).
   */
  const { setScreenInfo } = useAdvisorContext();
  const { globalHide } = usePrivacy();

  const [scenarioContext, setScenarioContext] = useState<string | null>(null);

  useEffect(function scrollToTopOnMount() {
    // Find the main scrollable container and scroll to top
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
    // Also try window scroll as fallback
    window.scrollTo(0, 0);
  }, []);

  // Calculate mock values
  const basePay = GS_BASE_PAY['GS-12'][4];
  const localityRate = LOCALITY_RATES['DC'];
  const localityPay = Math.round(basePay * localityRate);
  const localityAdjustedPay = basePay + localityPay;

  // Estimated benefits values
  const fehbValue = 8400; // Employer FEHB contribution
  const tspMatch = Math.round(localityAdjustedPay * 0.05); // 5% TSP match
  const leaveValue = Math.round(localityAdjustedPay * 0.12); // ~12% leave value
  const totalBenefitsValue = fehbValue + tspMatch + leaveValue;
  const totalCompensation = localityAdjustedPay + totalBenefitsValue;

  useEffect(function updateScreenContextOnLoad() {
    /**
     * Update PathAdvisor context when page loads.
     * This tells the advisor what screen the user is viewing so it can
     * provide relevant, context-aware assistance.
     */
    setScreenInfo(
      screenName,
      'help the user understand their current federal compensation snapshot and explore how changes to grade, step, or location affect their total package'
    );
  }, [setScreenInfo, screenName]);

  const handleScenarioChange = (scenario: {
    grade: string;
    step: number;
    locality: string;
    basePay: number;
    localityPay: number;
    totalPay: number;
  }) => {
    setScenarioContext(
      `User is exploring ${scenario.grade} Step ${scenario.step} ${scenario.locality} (Total: $${scenario.totalPay.toLocaleString()})`,
    );
  };

  const payBreakdown = [
    {
      label: 'Base Pay',
      value: basePay,
      percentage: (basePay / localityAdjustedPay) * 100,
    },
    {
      label: 'Locality Pay',
      value: localityPay,
      percentage: (localityPay / localityAdjustedPay) * 100,
    },
    {
      label: 'Overtime / Other',
      value: 0,
      percentage: 0,
      description: 'Not currently tracked',
    },
  ];

  const benefits = [
    {
      label: 'FEHB Annual Value',
      value: fehbValue,
      description: 'Employer premium contribution',
      tooltip: {
        title: 'FEHB Value',
        description:
          'The Federal Employees Health Benefits (FEHB) program is one of the largest employer-sponsored health insurance programs in the world.',
        details:
          'The government typically pays 72-75% of the premium cost. This represents the approximate employer contribution to your health insurance.',
      },
    },
    {
      label: 'TSP Match',
      value: tspMatch,
      description: '5% employer match estimate',
      tooltip: {
        title: 'TSP Matching',
        description:
          'The Thrift Savings Plan (TSP) offers automatic 1% agency contribution plus up to 4% matching on your contributions.',
        details:
          'If you contribute at least 5% of your salary to TSP, you receive the full 5% match from your agency. This is essentially free money for your retirement.',
      },
    },
    {
      label: 'Leave Value',
      value: leaveValue,
      description: 'Annual + Sick leave converted to value',
      tooltip: {
        title: 'Leave Accrual Value',
        description:
          'Federal employees earn both annual leave and sick leave. This value represents what your leave accrual would be worth as additional compensation.',
        details:
          'Based on your service time, you accrue 4-8 hours of annual leave per pay period, plus 4 hours of sick leave. This calculation estimates the monetary value of that benefit.',
      },
    },
  ];

  // Quick action prompts for PathAdvisor
  const quickActions = [
    {
      label: 'Explain my total compensation',
      prompt:
        'Explain how my total federal compensation is calculated, including pay and benefits.',
    },
    {
      label: 'Compare current and scenario pay',
      prompt: scenarioContext
        ? `Help me compare my current compensation with: ${scenarioContext}`
        : 'Help me understand how to compare compensation scenarios.',
    },
    {
      label: 'How does locality affect my pay?',
      prompt: 'Explain how locality pay works and how it affects my total federal salary.',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Compensation Overview</h1>
              <Badge className="bg-accent/20 text-accent border-accent/30 gap-1.5">
                <User className="w-3 h-3" />
                Current Federal Employee
              </Badge>
            </div>
            <p className="text-muted-foreground">
              See your current federal compensation snapshot and explore how changes to grade, step,
              or location affect your total package.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            {globalHide ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="text-xs">Privacy: {globalHide ? 'Active' : 'Off'}</span>
          </Badge>
        </div>
      </div>

      {/* Compensation Snapshot Cards */}
      <CompensationSnapshot
        grade={mockProfile.grade}
        step={mockProfile.step}
        series={mockProfile.series}
        locality={mockProfile.localityLabel}
        basePay={basePay}
        localityAdjustedPay={localityAdjustedPay}
        totalCompensation={totalCompensation}
      />

      {/* Pay & Benefits Breakdown */}
      <PayBenefitsBreakdown
        payBreakdown={payBreakdown}
        benefits={benefits}
        totalPay={localityAdjustedPay}
      />

      {/* Scenario Panel */}
      <CompensationScenarioPanel
        currentGrade={mockProfile.grade}
        currentStep={mockProfile.step}
        currentLocality={mockProfile.locality}
        onScenarioChange={handleScenarioChange}
      />

      {/* PathAdvisor Quick Actions */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <h3 className="text-sm font-semibold text-foreground mb-3">Ask PathAdvisor</h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs border-accent/30 hover:bg-accent/10 bg-transparent"
              onClick={() => {
                // In real implementation, this would trigger PathAdvisor with the prompt
                console.log('PathAdvisor prompt:', action.prompt);
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
        {scenarioContext && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Current context: {scenarioContext}
          </p>
        )}
      </div>
    </div>
  );
}
