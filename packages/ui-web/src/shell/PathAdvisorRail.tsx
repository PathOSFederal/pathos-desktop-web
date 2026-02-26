'use client';

import { useState } from 'react';

interface PathAdvisorRailProps {
  onSendMessage: (text: string) => void;
  onClearConversation: () => void;
}

export function PathAdvisorRail(props: PathAdvisorRailProps) {
  const onSendMessage = props.onSendMessage;
  const onClearConversation = props.onClearConversation;
  const [inputValue, setInputValue] = useState('');

  const handleSend = function () {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = function (event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="pathos-rail">
      <header className="pathos-rail-header">
        <h2>PathAdvisor</h2>
      </header>
      <div className="pathos-rail-messages">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>
            PathAdvisor uses your career and resume details to give tailored advice for promotions,
            lateral moves, and job announcements.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
            Local-first. Private by default.
          </p>
        </div>
      </div>
      <div className="pathos-rail-input-row">
        <input
          value={inputValue}
          onChange={function (event) {
            setInputValue(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask about job impact, PCS, relocation..."
          aria-label="Ask PathAdvisor"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </section>
  );
}
