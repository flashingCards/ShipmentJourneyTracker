
"use client";

import { format, differenceInDays, parseISO } from "date-fns";
import * as React from "react";

import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShipmentTimelineNodeProps = {
  shipmentId: string;
  node: TimelineEvent;
  isLast: boolean;
};

export default function ShipmentTimelineNode({
  node,
  isLast,
}: ShipmentTimelineNodeProps) {
  const delay =
    node.status === "completed" && node.actualDate
      ? differenceInDays(parseISO(node.actualDate), parseISO(node.plannedDate))
      : 0;

  const nodeStatusStyles = {
    completed: "bg-primary border-primary",
    "in-progress": "bg-accent border-accent animate-pulse",
    pending: "bg-muted-foreground/50 border-muted-foreground/50",
  };

  const iconStatusStyles = {
    completed: "text-primary-foreground",
    "in-progress": "text-accent-foreground",
    pending: "text-muted-foreground",
  };

  return (
    <div className="relative pb-8">
      {!isLast && (
        <div className="absolute left-4 top-5 -ml-px mt-0.5 h-full w-0.5 bg-border" />
      )}
      <div className="relative flex items-start space-x-4">
        <div>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              nodeStatusStyles[node.status]
            )}
          >
            <node.Icon
              className={cn("h-5 w-5", iconStatusStyles[node.status])}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-md font-semibold text-foreground">{node.stage}</p>
            {delay > 0 && (
              <p className="text-sm font-bold text-destructive">
                Delayed by {delay} Day{delay > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Planned:{" "}
              <time dateTime={node.plannedDate}>
                {format(parseISO(node.plannedDate), "MMM d, yyyy")}
              </time>
            </span>
            {node.actualDate && (
              <span>
                Actual:{" "}
                <time dateTime={node.actualDate}>
                  {format(parseISO(node.actualDate), "MMM d, yyyy")}
                </time>
              </span>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {node.comments && (
              <p className="text-sm text-foreground p-3 bg-muted rounded-md border">
                {node.comments}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
