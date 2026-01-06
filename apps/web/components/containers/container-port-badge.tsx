import { Badge } from "@/components/ui/badge";

type Props = {
  protocol: "IPv4" | "IPv6";
  hostPort: number;
  containerPort: number;
};

export function ContainerPortBadge({
  protocol,
  hostPort,
  containerPort,
}: Props) {
  return (
    <Badge className="font-mono font-normal" variant="outline">
      <span>{protocol}</span>
      <p className="font-medium">{`${hostPort}:${containerPort}`}</p>
    </Badge>
  );
}
