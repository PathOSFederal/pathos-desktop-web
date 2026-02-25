import type React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function SectionCard(props: SectionCardProps) {
  return (
    <section className="shared-section-card">
      <h2>{props.title}</h2>
      <div>{props.children}</div>
    </section>
  );
}
