interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <header className="shared-section-header">
      <h1>{props.title}</h1>
      <p>{props.subtitle}</p>
    </header>
  );
}
