export default function JobSearchLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-[500px] bg-muted rounded-lg" />
        <div className="lg:col-span-2 h-[500px] bg-muted rounded-lg" />
      </div>
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}
