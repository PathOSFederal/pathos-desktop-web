import { coreVersion } from '@pathos/core';

export function SharedBanner() {
  return (
    <div style={{ border: '1px solid #f59e0b', padding: '8px 12px', borderRadius: '6px', margin: '8px 0' }}>
      <strong>Shared UI active:</strong> PathOS shared core version {coreVersion}
    </div>
  );
}
