
"use client";

import * as React from "react";
import { addDays, differenceInDays, parseISO } from "date-fns";
import {
  Package,
  Radio,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { fetchAndParseShipments } from "@/lib/shipment-data";
import type { Shipment } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ShipmentCard from "@/components/shipment-card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-provider";
import { initiateAnonymousSignIn, useAuth, useUser } from "@/firebase";

export default function ShipmentTrackerPage() {
  const { journeyConfig, activeJourneyMode } = useAppContext();
  const [shipments, setShipments] = React.useState<Shipment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);


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
  
  React.useEffect(() => {
    if (shipments.length === 0) return;

    setShipments(prevShipments => {
      return prevShipments.map(shipment => {
        let lastKnownDate: Date | null = null;
        let lastStageIndex = -1;

        // Find the last completed event to use as the anchor for recalculation
        for(let i = shipment.timeline.length - 1; i >= 0; i--) {
            const event = shipment.timeline[i];
            if(event.status === 'completed' && event.actualDate) {
                lastKnownDate = parseISO(event.actualDate);
                lastStageIndex = i;
                break;
            }
        }

        // If no event is completed, start from the first event's planned date
        if(!lastKnownDate) {
            lastKnownDate = parseISO(shipment.timeline[0].plannedDate);
            lastStageIndex = -1;
        }

        const currentConfig = journeyConfig[activeJourneyMode];

        const newTimeline = [...shipment.timeline];
        let currentDate = lastKnownDate;
        
        for (let i = lastStageIndex + 1; i < newTimeline.length; i++) {
            const stageConfig = currentConfig.find(c => c.node === newTimeline[i].stage);
            const daysToAdd = stageConfig ? stageConfig.days : 1;
            
            currentDate = addDays(currentDate, daysToAdd);
            
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
  }, [activeJourneyMode, journeyConfig, shipments.length]);


  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
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
      
      <div className="flex justify-center mb-8">
        <Card className="w-full max-w-sm">
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
        {loading || isUserLoading ? (
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
            />
            ))
        )}
      </Accordion>
    </div>
  );
}
