import type { AlertRule, SavedSearch } from '@pathos/api';
import { EmptyState, SectionCard, SectionHeader } from '../components/primitives/screen-blocks';

const mockSavedSearches: SavedSearch[] = [];
const mockAlertRules: AlertRule[] = [];

export function CareerScreen() {
  return (
    <div className="shared-screen">
      <SectionHeader title="Career" subtitle="Plan and execute your next federal move." />
      <div className="shared-screen-grid">
        <SectionCard title="Target roles">
          <EmptyState message="Set your next target role to unlock tailored guidance." />
        </SectionCard>
        <SectionCard title="Saved searches">
          {mockSavedSearches.length === 0 ? (
            <EmptyState message="No saved searches yet." />
          ) : (
            <p>{String(mockSavedSearches.length)} saved searches</p>
          )}
        </SectionCard>
        <SectionCard title="Job alerts">
          {mockAlertRules.length === 0 ? (
            <EmptyState message="No active alerts yet." />
          ) : (
            <p>{String(mockAlertRules.length)} alert rules</p>
          )}
        </SectionCard>
        <SectionCard title="Resume builder">
          <p>Open Resume Builder to continue improving your federal resume.</p>
        </SectionCard>
      </div>
    </div>
  );
}
