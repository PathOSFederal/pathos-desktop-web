import { LoadingState, SectionCard, SectionHeader } from '../components/primitives/screen-blocks';

export function DashboardScreen() {
  return (
    <div className="shared-screen">
      <SectionHeader title="Dashboard" subtitle="Your PathOS command center." />
      <div className="shared-screen-grid">
        <SectionCard title="Daily Path Brief">
          <p>Key priorities are organized for fast execution.</p>
        </SectionCard>
        <SectionCard title="Upcoming Milestones">
          <LoadingState message="Milestone insights are loading." />
        </SectionCard>
        <SectionCard title="Recent Activity">
          <p>Latest desktop and web actions are visible in one place.</p>
        </SectionCard>
      </div>
    </div>
  );
}
