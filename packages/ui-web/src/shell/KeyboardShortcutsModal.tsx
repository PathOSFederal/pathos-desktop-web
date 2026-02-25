'use client';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal(props: KeyboardShortcutsModalProps) {
  const open = props.open;
  const onClose = props.onClose;

  if (!open) {
    return null;
  }

  return (
    <div className="pathos-shortcuts-overlay" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="pathos-shortcuts-modal">
        <header className="pathos-shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <ul className="pathos-shortcuts-list">
          <li>
            <strong>?</strong> Open shortcuts
          </li>
          <li>
            <strong>g d</strong> Go to dashboard
          </li>
          <li>
            <strong>g c</strong> Go to career
          </li>
          <li>
            <strong>g s</strong> Go to settings
          </li>
        </ul>
      </div>
    </div>
  );
}
