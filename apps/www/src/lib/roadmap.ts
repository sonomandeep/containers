export type RoadmapItemState = "NOT_STARTED" | "IN_PROGRESS" | "SHIPPED";

export const roadmapMappings: Record<RoadmapItemState, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  SHIPPED: "Shipped",
} as const;
