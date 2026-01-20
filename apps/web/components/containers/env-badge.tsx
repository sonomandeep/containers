import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
};

export function EnvBadge({ label }: Props) {
  return (
    <Badge variant="outline">
      <p className="font-medium uppercase">{label}</p>
    </Badge>
  );
}
