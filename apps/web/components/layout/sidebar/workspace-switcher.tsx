"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type WorkspaceSwitcherProps = {
  workspaceSlug: string;
};

type Workspace = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

const FALLBACK_WORKSPACE_SWITCH_ERROR = "Unable to switch workspace.";

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [switchingWorkspaceId, setSwitchingWorkspaceId] = useState<
    string | null
  >(null);
  const {
    data: listOrganizationsData,
    isPending: isListingOrganizations,
    error: listOrganizationsError,
  } = auth.useListOrganizations();

  const workspaces = parseWorkspaceList(listOrganizationsData);
  const activeWorkspace =
    workspaces.find((workspace) => workspace.slug === workspaceSlug) ?? null;
  const activeWorkspaceName = activeWorkspace?.name || "Workspace";
  const activeWorkspaceHandle = activeWorkspace?.slug || workspaceSlug;

  async function handleWorkspaceSelect(workspace: Workspace) {
    if (workspace.slug === workspaceSlug || switchingWorkspaceId !== null) {
      return;
    }

    setSwitchingWorkspaceId(workspace.id);

    try {
      const { error } = await auth.organization.setActive({
        organizationId: workspace.id,
      });

      if (error) {
        toast.error(error.message || FALLBACK_WORKSPACE_SWITCH_ERROR);
        return;
      }

      const nextPath = buildWorkspacePath({
        currentWorkspaceSlug: workspaceSlug,
        nextWorkspaceSlug: workspace.slug,
        pathname,
        searchParams: searchParams.toString(),
      });

      router.replace(nextPath);
      router.refresh();
    } catch {
      toast.error(FALLBACK_WORKSPACE_SWITCH_ERROR);
    } finally {
      setSwitchingWorkspaceId(null);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />
            }
          >
            <WorkspaceAvatar
              logo={activeWorkspace?.logo ?? null}
              name={activeWorkspaceName}
              slug={activeWorkspaceHandle}
            />
            <span className="truncate font-medium">{activeWorkspaceName}</span>

            {switchingWorkspaceId ? (
              <Spinner className="ml-auto size-3" />
            ) : (
              <ChevronsUpDownIcon className="ml-auto size-3!" />
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
            </DropdownMenuGroup>

            {isListingOrganizations && (
              <DropdownMenuItem disabled>
                <Spinner className="size-3" />
                Loading workspaces...
              </DropdownMenuItem>
            )}

            {!isListingOrganizations && listOrganizationsError && (
              <DropdownMenuItem disabled>
                {extractErrorMessage(listOrganizationsError)}
              </DropdownMenuItem>
            )}

            {!(isListingOrganizations || listOrganizationsError) &&
              workspaces.length === 0 && (
                <DropdownMenuItem disabled>
                  No workspaces found.
                </DropdownMenuItem>
              )}

            {!(isListingOrganizations || listOrganizationsError) &&
              workspaces.map((workspace) => {
                const isCurrentWorkspace = workspace.slug === workspaceSlug;
                const isSwitchingCurrent =
                  switchingWorkspaceId === workspace.id;
                const indicator = getWorkspaceIndicator({
                  isCurrentWorkspace,
                  isSwitchingCurrent,
                });

                return (
                  <DropdownMenuItem
                    className="py-2"
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace)}
                  >
                    <WorkspaceAvatar
                      logo={workspace.logo ?? null}
                      name={workspace.name}
                      slug={workspace.slug}
                    />

                    <div className="grid min-w-0">
                      <span className="truncate">{workspace.name}</span>
                    </div>

                    {indicator}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function parseWorkspaceList(input: unknown): Array<Workspace> {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((workspace) => {
    if (!isWorkspace(workspace)) {
      return [];
    }

    return [workspace];
  });
}

function getWorkspaceIndicator({
  isCurrentWorkspace,
  isSwitchingCurrent,
}: {
  isCurrentWorkspace: boolean;
  isSwitchingCurrent: boolean;
}) {
  if (isSwitchingCurrent) {
    return <Spinner className="ml-auto size-3" />;
  }

  if (isCurrentWorkspace) {
    return <CheckIcon className="ml-auto size-3" />;
  }

  return <span aria-hidden="true" className="ml-auto size-3" />;
}

function WorkspaceAvatar({
  logo,
  name,
  slug,
  className,
}: {
  logo: string | null;
  name: string;
  slug: string;
  className?: string;
}) {
  const initial = getWorkspaceInitial(name, slug);

  return (
    <Avatar
      className={cn(
        "size-6 after:rounded-md has-[img]:after:border-0",
        className
      )}
    >
      <AvatarImage
        alt={`${name} logo`}
        className="rounded-md p-0.5"
        src={logo || undefined}
      />
      <AvatarFallback className="rounded-md font-medium font-mono uppercase">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

function getWorkspaceInitial(name: string, slug: string) {
  const normalizedName = name.trim();
  if (normalizedName.length > 0) {
    return normalizedName.charAt(0);
  }

  const normalizedSlug = slug.trim();
  if (normalizedSlug.length > 0) {
    return normalizedSlug.charAt(0);
  }

  return "A";
}

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") {
    return false;
  }

  const workspace = value as Partial<Workspace>;
  const isValidLogo =
    workspace.logo === null ||
    workspace.logo === undefined ||
    typeof workspace.logo === "string";

  return (
    typeof workspace.id === "string" &&
    typeof workspace.name === "string" &&
    typeof workspace.slug === "string" &&
    isValidLogo
  );
}

function buildWorkspacePath({
  currentWorkspaceSlug,
  nextWorkspaceSlug,
  pathname,
  searchParams,
}: {
  currentWorkspaceSlug: string;
  nextWorkspaceSlug: string;
  pathname: string;
  searchParams: string;
}) {
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);

  if (pathSegments.length < 2 || pathSegments[0] !== currentWorkspaceSlug) {
    return buildWorkspaceContainersPath(nextWorkspaceSlug, searchParams);
  }

  const rewrittenPath = `/${[nextWorkspaceSlug, ...pathSegments.slice(1)].join("/")}`;
  return searchParams.length > 0
    ? `${rewrittenPath}?${searchParams}`
    : rewrittenPath;
}

function buildWorkspaceContainersPath(
  workspaceSlug: string,
  searchParams: string
) {
  const path = `/${workspaceSlug}/containers`;
  return searchParams.length > 0 ? `${path}?${searchParams}` : path;
}

function extractErrorMessage(error: unknown) {
  if (!error) {
    return "Unable to load workspaces.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error) {
    const details = error as { message?: string };
    if (typeof details.message === "string" && details.message.length > 0) {
      return details.message;
    }
  }

  return "Unable to load workspaces.";
}
