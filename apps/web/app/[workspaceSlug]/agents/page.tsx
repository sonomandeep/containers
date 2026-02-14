import { CheckIcon, EllipsisVerticalIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/core/card";
import { MetricInfo } from "@/components/core/metric-info";
import { SectionCard } from "@/components/core/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <div className="grid h-full min-h-0 grid-cols-5 gap-3 overflow-hidden">
      <SectionCard className="@container col-span-3 min-h-0 overflow-hidden">
        <AgentCard />
        <AgentCard />
        <AgentCard />
        <AgentCard />
      </SectionCard>

      <SectionCard className="@container col-span-2 min-h-0 overflow-hidden" />
    </div>
  );
}

export function AgentCard() {
  return (
    <Card>
      <CardToolbar>
        <span className="font-mono">test</span>

        <div className="inline-flex items-center gap-1">
          <Button size="icon-sm" variant="ghost">
            <EllipsisVerticalIcon />
          </Button>
        </div>
      </CardToolbar>

      <CardContent>
        <CardHeader>
          <div className="inline-flex w-full items-center justify-between">
            <div className="inline-flex gap-2">
              <CardTitle>ACME Agent</CardTitle>
              <span className="text-muted-foreground">v0.0.1</span>
            </div>
            <Badge variant="success">
              <CheckIcon />
              Online
            </Badge>
          </div>

          <CardDescription>us-east-1 (ubuntu/amd64)</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-4 gap-3">
          <MetricInfo label="Containers" value="8 / 12" />
          <MetricInfo label="CPU" sub="4 cores" value="24.7%" />
          <MetricInfo label="Memory" sub="3.3 / 8 GB" value="41.7%" />
          <MetricInfo label="Disk" sub="47 / 80 GB" value="59.3%" />
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <span>Last message 15 seconds ago</span>
        <span>192.168.1.128</span>
      </CardFooter>
    </Card>
  );
}
