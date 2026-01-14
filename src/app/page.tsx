
"use client";

import * as React from "react";
import { addDays, differenceInDays, parseISO } from "date-fns";
import {
  Link as LinkIcon,
  Package,
  Radio,
  Settings,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { fetchAndParseShipments } from "@/lib/shipment-data";
import type { JourneyMode, Shipment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import ShipmentCard from "@/components/shipment-card";
import { Toaster } from "@/components/ui/toaster";

export default function ShipmentTrackerPage() {
  const [shipments, setShipments] = React.useState<Shipment[]>([]);
  const [journeyMode, setJourneyMode] = React.useState<JourneyMode>(10);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const loadShipments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAndParseShipments();
      setShipments(data);
      toast({
        title: "Data Refreshed",
        description: "Shipment data has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to load shipments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch shipment data.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    loadShipments();
  }, [loadShipments]);


  const handleCommentChange = (
    shipmentId: string,
    timelineEventId: string,
    comment: string
  ) => {
    setShipments((prevShipments) =>
      prevShipments.map((shipment) =>
        shipment.id === shipmentId
          ? {
              ...shipment,
              timeline: shipment.timeline.map((event) =>
                event.id === timelineEventId ? { ...event, comments: comment } : event
              ),
            }
          : shipment
      )
    );
  };
  
  React.useEffect(() => {
    if (shipments.length === 0) return;

    setShipments(prevShipments => {
      return prevShipments.map(shipment => {
        let lastKnownDate = parseISO(shipment.timeline[0].plannedDate);
        let lastKnownDateIsActual = false;

        let firstPendingIndex = -1;

        for (let i = 0; i < shipment.timeline.length; i++) {
          const event = shipment.timeline[i];
          if (event.status === 'completed' && event.actualDate) {
            lastKnownDate = parseISO(event.actualDate);
            lastKnownDateIsActual = true;
          } else {
            if (firstPendingIndex === -1) {
              firstPendingIndex = i;
            }
          }
        }
        
        if (firstPendingIndex === -1) return shipment;

        const remainingStages = shipment.timeline.length - firstPendingIndex;
        if(remainingStages <= 0) return shipment;
        
        const daysPerStage = journeyMode / shipment.timeline.length;
        
        let currentDate = lastKnownDateIsActual ? lastKnownDate : parseISO(shipment.timeline[firstPendingIndex].plannedDate);
        
        const newTimeline = [...shipment.timeline];

        for (let i = firstPendingIndex; i < newTimeline.length; i++) {
            currentDate = addDays(currentDate, daysPerStage);
            newTimeline[i] = {
                ...newTimeline[i],
                plannedDate: currentDate.toISOString(),
            };
        }

        const newOverallStatus = newTimeline.some(event => {
            if (event.status === 'completed' && event.actualDate) {
                return differenceInDays(parseISO(event.actualDate), parseISO(event.plannedDate)) > 0;
            }
            return false;
        }) ? 'Delayed' : 'On-Time';
        
        return { ...shipment, timeline: newTimeline, status: newOverallStatus };
      });
    });
  }, [journeyMode, shipments.length]);

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Radio className="h-5 w-5" />
          <span className="font-bold">LIVE</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-headline">
          Shipment Journey Tracker
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Monitor your shipments in real-time, analyze delays, and manage logistics with dynamic journey configurations.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Journey Configuration</CardTitle>
                <CardDescription>Select a mode to recalculate guidance dates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={String(journeyMode)}
              onValueChange={(val) => setJourneyMode(Number(val) as JourneyMode)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {[10, 12, 15].map(mode => (
                <Label key={mode} htmlFor={`mode-${mode}`} className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  journeyMode === mode && "border-primary"
                )}>
                  <RadioGroupItem value={String(mode)} id={`mode-${mode}`} className="sr-only" />
                  <span className="text-2xl font-bold">{mode}</span>
                  <span className="text-sm text-muted-foreground">Days</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Refresh Data</CardTitle>
                    <CardDescription>Fetch the latest shipment data.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={loadShipments} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Package className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Active Shipments ({shipments.length})</h2>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-24 bg-muted rounded animate-pulse" />
            </Card>
          ))
        ) : (
            shipments.map((shipment) => (
            <ShipmentCard 
                key={shipment.id} 
                shipment={shipment} 
                onCommentChange={handleCommentChange} 
            />
            ))
        )}
      </Accordion>
      <Toaster />
    </div>
  );
}

    