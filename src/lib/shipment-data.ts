
import {
  Package,
  Warehouse,
  Truck,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import type { Shipment, TimelineEvent } from "@/lib/types";

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT55R-BoWFUg1rUYEbhwj0fhX5Nr1a25r3oo1GmKrUFvbvHqRCaqfgDKAPJsT1sV43LfCDQAlLfjdPj/pub?output=csv';

const iconMap: { [key: string]: LucideIcon } = {
  Package,
  Warehouse,
  Truck,
  PackageCheck,
};

function parseCSV(csv: string): any[] {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(h => h.trim());
  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j]?.trim();
    }
    result.push(obj);
  }
  return result;
}


export async function fetchAndParseShipments(): Promise<Shipment[]> {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();
  const flatData = parseCSV(csvText);

  const shipmentsMap: { [key: string]: Shipment } = {};

  for (const row of flatData) {
    if (!row.id) continue;

    if (!shipmentsMap[row.id]) {
      shipmentsMap[row.id] = {
        id: row.id,
        scancode: row.scancode,
        company: row.company,
        serviceType: row.serviceType,
        status: row.status as Shipment['status'],
        timeline: [],
      };
    }

    const timelineEvent: TimelineEvent = {
      id: row.timeline_id,
      stage: row.timeline_stage,
      status: row.timeline_status as TimelineEvent['status'],
      plannedDate: row.timeline_plannedDate,
      actualDate: row.timeline_actualDate || undefined,
      comments: row.timeline_comments || "",
      Icon: iconMap[row.timeline_Icon] || Package,
    };
    
    shipmentsMap[row.id].timeline.push(timelineEvent);
  }
  
  Object.values(shipmentsMap).forEach(shipment => {
      shipment.timeline.sort((a,b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  });

  return Object.values(shipmentsMap);
}

    