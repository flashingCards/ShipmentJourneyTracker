# **App Name**: Shipment Journey Tracker

## Core Features:

- Shipment Card Display: Display shipment cards with key details like scancode, company, service type, and status.
- Shipment Timeline: Display a vertical timeline of the shipment, indicating different stages and their respective dates and delays, resembling a 'Train Running Status' UI.
- Delay Analysis: Calculate the delay at each shipment stage and provide an overall delay status (On-Time / Delayed), highlighted by color indicators.
- Dynamic Timeline Calculation: Based on configuration setting recalculate guidance dates and the critical path.
- Comment Management: Enable users to add and save comments for each delayed shipment node to track and persist remarks.
- Configuration Modes: Allow users to select from predefined journey modes (10, 12, 15 days) to automatically update shipment guidance dates.
- Google Sheet Integration: Tool for connecting to a Google Sheet via link, ingesting shipment data, and triggering a recalculation if data changes. 

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke a sense of trust and reliability, aligned with logistics.
- Background color: Light gray (#F5F5F5), almost white, to provide a clean, uncluttered backdrop that highlights data.
- Accent color: A teal/cyan color (#00BCD4), a lively shade, for interactive elements and status indicators, analogous to the primary with higher brightness and saturation to draw attention.
- Body and headline font: 'Inter', sans-serif. Clean and versatile.
- Use clear, consistent icons to represent shipment milestones and status indicators.
- Design the app with a mobile-first approach, ensuring the timeline and shipment details are easily accessible and navigable on smaller screens.
- Use smooth, subtle animations to expand/collapse shipment cards and transition between views.