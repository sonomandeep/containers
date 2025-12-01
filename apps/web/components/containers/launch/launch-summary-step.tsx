"use client";

interface Props {
  handleBack: () => void;
}

export function LaunchSummaryStep({ handleBack }: Props) {
  return (
    <div className="rounded-md border p-4 text-left">
      <p className="text-sm font-medium">Summary</p>
      <p className="text-sm text-muted-foreground">
        Review your container configuration before launch.
      </p>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium">my-container</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Image</dt>
          <dd className="font-medium">node:20-alpine</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Ports</dt>
          <dd className="font-medium">8080 → 3000</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Resources</dt>
          <dd className="font-medium">
            1.5 vCPU / 512 MB / restart: on-failure
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">Env</dt>
          <dd className="font-medium">NODE_ENV=production</dd>
        </div>
      </dl>
    </div>
  );
}
