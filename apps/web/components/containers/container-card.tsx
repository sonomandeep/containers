import {
  EllipsisVerticalIcon,
  FileTextIcon,
  FolderKeyIcon,
  HardDriveIcon,
  NetworkIcon,
  RotateCwIcon,
  SquareIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/core/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContainerPortBadge } from "./container-port-badge";
import { ContainerStatus } from "./container-status";

type PortProtocol = "IPv4" | "IPv6";
type DiskIO = {
  read: number;
  write: number;
};
type PortMapping = {
  protocol: PortProtocol;
  host_port: number;
  container_port: number;
};
export type ContainerInfo = {
  id: string;
  name: string;
  image: string;
  status: "RUNNING" | "STOPPED" | "RESTARTING";
  cpu_percent: number;
  memory_mb: number;
  network_kbps: number;
  disk_io_mb: DiskIO;
  ports: Array<PortMapping>;
  uptime: string;
  environment: string;
};

type Props = {
  container: any;
};

export function ContainerCard({ container }: Props) {
  return (
    <Card key={container.id}>
      <CardToolbar>
        <span className="font-mono">{container.id}</span>

        <div className="inline-flex items-center gap-1">
          <Button size="icon-sm" variant="ghost">
            <SquareIcon />
          </Button>

          <Button size="icon-sm" variant="ghost">
            <RotateCwIcon />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="icon-sm" variant="ghost" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileTextIcon />
                Logs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NetworkIcon />
                Ports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderKeyIcon />
                Variables
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HardDriveIcon />
                Volumes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SquareTerminalIcon />
                Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardToolbar>

      <CardContent>
        <CardHeader>
          <div className="inline-flex w-full items-center justify-between">
            <CardTitle>{container.name}</CardTitle>
            <ContainerStatus status={container.status} />
          </div>

          <CardDescription>{container.image}</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          <ContainerMetric label="CPU" value={`${container.cpu_percent} %`} />
          <ContainerMetric label="Memory" value={`${container.memory_mb} MB`} />
          <ContainerMetric
            label="Network"
            value={`${container.network_kbps} Kbps`}
          />
          <ContainerMetric
            label="Disk I/O"
            value={`${`${container.disk_io_mb?.read} MB / ${container.disk_io_mb?.write} MB`}`}
          />
        </div>

        <div className="inline-flex flex-nowrap gap-2 overflow-hidden">
          {container.ports?.map((port) => (
            <ContainerPortBadge
              containerPort={port.private}
              hostPort={port.public}
              key={`${port.ipVersion}_${port.public}:${port.private}`}
              protocol={port.ipVersion}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <span>{container.uptime}</span>
        <span>{container.environment}</span>
      </CardFooter>
    </Card>
  );
}

function ContainerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full flex-col">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium text-neutral-700 text-sm">{value}</p>
    </div>
  );
}
