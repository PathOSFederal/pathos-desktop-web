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

  const suggestedPrompts = [
    'What roles match my experience?',
    'How does this job impact my retirement?',
    'What are the PCS requirements?',
  ];

  return (
    <section className="pathos-rail">
      <header className="pathos-rail-header">
        <h2>
          <span className="pathos-rail-header-icon">●</span>
          PathAdvisor
        </h2>
      </header>
      <div className="pathos-rail-chips">
        <div className="pathos-rail-chip">
          <span className="pathos-rail-chip-icon">●</span>
          <span>Viewing: Job Search</span>
        </div>
        <div className="pathos-rail-chip">
          <span>Privacy: Visible</span>
        </div>
      </div>
      <div className="pathos-rail-messages">
        <div className="pathos-rail-suggested-prompts">
          {suggestedPrompts.map(function (prompt, index) {
            return (
              <button
                key={index}
                type="button"
                className="pathos-rail-prompt-item"
                onClick={function () {
                  setInputValue(prompt);
                }}
              >
                {prompt}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pathos-rail-input-row">
        <input
          value={inputValue}
          onChange={function (event) {
            setInputValue(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask about job impact, PCS, retirement..."
          aria-label="Ask PathAdvisor"
        />
        <button
          type="button"
          className="pathos-rail-send-button"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <span className="pathos-rail-send-icon">→</span>
        </button>
      </div>
    </section>
  );
}
