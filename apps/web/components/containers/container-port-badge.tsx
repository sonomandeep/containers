import { Badge } from "@/components/ui/badge";

type Props = {
  ipVersion: string;
  host: number | undefined;
  container: number;
};

export function ContainerPortBadge({ ipVersion, host, container }: Props) {
  return (
    <Badge className="font-mono font-normal" variant="outline">
      <span>{ipVersion}</span>
      <p className="font-medium">{getPortMapping(host, container)}</p>
    </Badge>
  );
}

function getPortMapping(host: number | undefined, container: number) {
  if (!host) {
    return String(container);
  }

  return `${host}:${container}`;
}
