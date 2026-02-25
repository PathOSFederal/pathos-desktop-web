interface LoadingStateProps {
  message: string;
}

export function LoadingState(props: LoadingStateProps) {
  return <p className="shared-loading-state">{props.message}</p>;
}
