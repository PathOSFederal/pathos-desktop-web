interface EmptyStateProps {
  message: string;
}

export function EmptyState(props: EmptyStateProps) {
  return <p className="shared-empty-state">{props.message}</p>;
}
