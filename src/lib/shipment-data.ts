
import {
  Package,
  Warehouse,
  Truck,
  PackageCheck,
  Ship,
  Landmark,
  Plane,
  type LucideIcon,
} from "lucide-react";
import type { Shipment, TimelineEvent } from "@/lib/types";

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT55R-BoWFUg1rUYEbhwj0fhX5Nr1a25r3oo1GmKrUFvbvHqRCaqfgDKAPJsT1sV43LfCDQAlLfjdPj/pub?gid=0&single=true&output=csv';

const iconMap: { [key: string]: LucideIcon } = {
  "Pickup": Landmark,
  "Flight-out": Plane,
  "Landed": Ship,
  "Cleared at DC": Warehouse,
  "Injection": Truck,
  "Delivery": PackageCheck,
  "Default": Package,
};

function parseCSV(csv: string): any[] {
    const lines = csv.split(/[\r\n]+/).filter(line => line.trim() !== '');
    if (lines.length < 3) return [];
  
    const headers = lines[1].split(',').map(h => h.trim().replace(/\s+/g, '_').replace(/[\(\)]/g, ''));
    const dataLines = lines.slice(2);
  
    const result = dataLines.map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  
    return result;
}

function getStatus(actualDateStr?: string, plannedDateStr?: string): TimelineEvent['status'] {
    if (actualDateStr && actualDateStr.trim() !== '') {
        return 'completed';
    }
    if (plannedDateStr && plannedDateStr.trim() !== '') {
        try {
            if(new Date(plannedDateStr) < new Date()){
                return 'in-progress';
            }
        } catch(e) {
            // Invalid date, treat as pending
        }
    }
    return 'pending';
}

function parseDate(dateString?: string): Date | null {
    if (!dateString || dateString.trim() === '' || dateString.toLowerCase() === 'na') return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const monthIndex = new Date(Date.parse(month +" 1, 2012")).getMonth();
      if (!isNaN(parseInt(year)) && !isNaN(monthIndex) && !isNaN(parseInt(day))) {
          // Years like '24' should be '2024'
          const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
          return new Date(fullYear, monthIndex, parseInt(day));
      }
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
        return d;
    }
    return null;
}


export async function fetchAndParseShipments(): Promise<Shipment[]> {
  const response = await fetch(SHEET_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.statusText}`);
  }
  const csvText = await response.text();
  const flatData = parseCSV(csvText);

  const shipments: Shipment[] = flatData.map((row, index) => {
    const scancode = row.scancode || `shipment-${index}`;
    
    const timeline: TimelineEvent[] = [];

    const stages = [
      { name: "Pickup", guidance: row.Guidance_At_origin, actual: row.Actal_At_origin, remarks: row.Remarks },
      { name: "Flight-out", guidance: row.Guidance_Flightout, actual: row.Actual_Flyout, remarks: row.Remarks_1 },
      { name: "Landed", guidance: row.Guidance_Landed, actual: row.Actual_Landed, remarks: row.Remarks_2 },
      { name: "Cleared at DC", guidance: row.Guidance_Cleared_at_DC, actual: row.Actual_Cleared_at_DC, remarks: row.Remarks_and_logs },
      { name: "Injection", guidance: row.Guidance_Injection, actual: row.Actual_injection, remarks: row.Remarks_3 },
      { name: "Delivery", guidance: row.Guidance_Delivery, actual: row.Actual_Delivery, remarks: row.Remarks_4 },
    ];
    
    let overallDelayed = false;

    stages.forEach((stage, stageIndex) => {
        const plannedDateObj = parseDate(stage.guidance);
        const actualDateObj = parseDate(stage.actual);

        if (plannedDateObj) { // An event must have at least a planned date
            const plannedDate = plannedDateObj.toISOString();
            const actualDate = actualDateObj ? actualDateObj.toISOString() : undefined;
            
            if (actualDate && new Date(actualDate) > new Date(plannedDate)) {
                overallDelayed = true;
            }

            timeline.push({
                id: `${scancode}-stage-${stageIndex}`,
                stage: stage.name,
                plannedDate,
                actualDate,
                commentsFromSheet: stage.remarks || "",
                status: getStatus(stage.actual, stage.guidance),
                Icon: iconMap[stage.name] || iconMap["Default"],
            });
        }
    });

    timeline.sort((a,b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

    let shipmentStatus: Shipment['status'] = 'On-Time';
    const exceptionText = row.Exception || '';
    if(exceptionText && exceptionText.toLowerCase() !== 'false' && exceptionText.trim() !== '') {
        shipmentStatus = 'Exception';
    } else if (timeline.length > 0 && timeline[timeline.length - 1].status === 'completed') {
        shipmentStatus = 'Delivered';
    } else if (overallDelayed) {
        shipmentStatus = 'Delayed';
    }

    return {
      id: scancode,
      scancode: scancode,
      company: row.company || 'N/A',
      serviceType: row.Service_type || 'N/A',
      country: row.Country,
      exception: exceptionText,
      status: shipmentStatus,
      timeline: timeline,
    };
  }).filter(shipment => shipment.timeline.length > 0 && shipment.scancode);

  return shipments;
}
