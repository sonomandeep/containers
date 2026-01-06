import type { ContainerState } from "@containers/shared";
import { PlayIcon, RotateCwIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  state: ContainerState;
};

export function ContainerStateBadge({ state }: Props) {
  if (state === "restarting") {
    return (
      <Badge variant="warning">
        <RotateCwIcon data-icon="inline-start" />
        <span>Restarting</span>
      </Badge>
    );
  }

  if (state === "exited") {
    return (
      <Badge variant="error">
        <SquareIcon data-icon="inline-start" />
        <span>Exited</span>
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
