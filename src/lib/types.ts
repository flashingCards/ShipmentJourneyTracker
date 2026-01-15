import type { LucideIcon } from "lucide-react";

export type JourneyMode = 10 | 12 | 15;

export const shipmentNodes = ["Origin", "Pickup", "Flight-out", "Landed", "Cleared at DC", "Injection", "Delivery"];

export type JourneyNodeConfig = {
  node: string;
  days: number;
}

export type JourneyConfig = {
  [key in JourneyMode]: JourneyNodeConfig[];
};

export type TimelineEvent = {
  id: string;
  stage: string;
  status: 'completed' | 'in-progress' | 'pending';
  plannedDate: string;
  actualDate?: string;
  comments: string;
  Icon: LucideIcon;
};

export type Shipment = {
  id: string; // Using scancode as ID
  scancode: string;
  company: string;
  serviceType: string;
  status: 'On-Time' | 'Delayed' | 'Delivered' | 'Exception';
  timeline: TimelineEvent[];
  country?: string;
  exception?: string;
};
