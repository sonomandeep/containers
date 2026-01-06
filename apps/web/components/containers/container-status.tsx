import { PlayIcon, RotateCwIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  status: "RUNNING" | "RESTARTING" | "STOPPED";
};

export function ContainerStatus({ status }: Props) {
  if (status === "RESTARTING") {
    return (
      <Badge variant="warning">
        <RotateCwIcon data-icon="inline-start" />
        <span>Restarting</span>
      </Badge>
    );
  }

  if (status === "STOPPED") {
    return (
      <Badge variant="error">
        <SquareIcon data-icon="inline-start" />
        <span>Stopped</span>
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      <PlayIcon data-icon="inline-start" />
      <span>Running</span>
    </Badge>
  );
}
