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

  return (
    <section className="pathos-rail">
      <header className="pathos-rail-header">
        <h2>PathAdvisor</h2>
        <button type="button" onClick={onClearConversation}>
          Clear
        </button>
      </header>
      <div className="pathos-rail-messages">
        <p>Conversation workspace (shared UI scaffold).</p>
      </div>
      <div className="pathos-rail-input-row">
        <input
          value={inputValue}
          onChange={function (event) {
            setInputValue(event.target.value);
          }}
          placeholder="Ask PathAdvisor"
        />
        <button
          type="button"
          onClick={function () {
            onSendMessage(inputValue);
            setInputValue('');
          }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
