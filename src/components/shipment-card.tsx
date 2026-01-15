"use client";

import { format, differenceInDays, parseISO } from "date-fns";
import { ChevronDown, BarChart2, AlertTriangle } from "lucide-react";
import * as React from "react";

import type { Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ShipmentTimelineNode from "@/components/shipment-timeline-node";

type ShipmentCardProps = {
  shipment: Shipment;
  onCommentChange: (
    shipmentId: string,
    timelineEventId: string,
    comment: string
  ) => void;
};

const StatusBadge = ({ status }: { status: Shipment["status"] }) => {
  const baseClasses = "text-xs font-bold py-1 px-3 rounded-full capitalize";
  const statusClasses = {
    "On-Time": "bg-blue-100 text-primary dark:bg-blue-900/50 dark:text-blue-300",
    Delayed:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    Delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Exception:
      "bg-destructive/10 text-destructive dark:bg-red-900/50 dark:text-red-300",
  };

  return <div className={cn(baseClasses, statusClasses[status])}>{status}</div>;
};

export default function ShipmentCard({
  shipment,
  onCommentChange,
}: ShipmentCardProps) {
  const overallDelay = React.useMemo(() => {
    return shipment.timeline.reduce((acc, event) => {
      if (event.status === "completed" && event.actualDate) {
        const delay = differenceInDays(
          parseISO(event.actualDate),
          parseISO(event.plannedDate)
        );
        return acc + (delay > 0 ? delay : 0);
      }
      return acc;
    }, 0);
  }, [shipment.timeline]);

  return (
    <AccordionItem
      value={shipment.id}
      className="border-none"
    >
      <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>div:last-child>div>svg]:rotate-180">
        <div className="flex w-full flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between p-4 sm:p-6">
            <div className="grid gap-1.5 flex-1">
              <span className="font-semibold text-primary">{shipment.scancode}</span>
              <h3 className="text-lg font-bold text-left">{shipment.company}</h3>
              <p className="text-sm text-muted-foreground">
                {shipment.serviceType} {shipment.country && `(${shipment.country})`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={shipment.status} />
               <Badge variant="outline" className="hidden sm:inline-flex items-center">
                Expand <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200" />
               </Badge>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 sm:p-6 bg-card rounded-b-lg -mt-2 border-t">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                <h4 className="text-lg font-semibold">Shipment Timeline</h4>
            </div>
             {shipment.status !== 'Delivered' && (
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Delay</p>
                    <p className={cn("text-xl font-bold", overallDelay > 0 ? 'text-orange-600' : 'text-green-600')}>
                        {overallDelay > 0 ? `${overallDelay} Day${overallDelay > 1 ? 's' : ''}` : 'On Time'}
                    </p>
                </div>
            )}
        </div>
        
        {shipment.status === "Exception" && shipment.exception && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-bold">Exception</p>
              <p className="text-sm">{shipment.exception}</p>
            </div>
          </div>
        )}

        <div className="flow-root">
          {shipment.timeline.map((event, index) => (
            <ShipmentTimelineNode
              key={event.id}
              shipmentId={shipment.id}
              node={event}
              onCommentChange={onCommentChange}
              isLast={index === shipment.timeline.length - 1}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
