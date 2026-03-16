# GTFS v29 Exporter

This module exports transit data in GTFS v29 format, which is a custom extension of the GTFS standard used by Carris Metropolitana.

## Structure

The module has been modernized and refactored into a modular architecture:

```
src/
├── index.ts           # Main entry point and exports
├── types.ts           # TypeScript type definitions
├── utils.ts           # Utility functions
├── main.ts            # Main orchestration logic
└── exports/           # Export functions for each GTFS entity
    ├── index.ts       # Export aggregator
    ├── agency.ts      # Agency and feed_info export
    ├── routes.ts      # Routes export
    ├── fares.ts       # Fare attributes and rules export
    ├── stops.ts       # Stops export
    ├── shapes.ts      # Shapes export
    └── afetacao.ts    # Zoning/afetacao export
```

## Usage

```typescript
import { exportGtfsV29, GtfsV29ExportConfig } from '@tmlmobilidade/go-offer-gtfs-exporter';
import { CsvWriter } from '@tmlmobilidade/writers';

const exportConfig: GtfsV29ExportConfig = {
  agency_id: 'agency-id',
  version: '20240101-1200',
  workdir: '/tmp/export',
  feed_start_date: '20240101',
  feed_end_date: '20241231',
  // ... other config
  writers: {
    agency: new CsvWriter('agency.txt', '/tmp/export/agency.txt'),
    // ... other writers
  }
};

await exportGtfsV29(progress, exportConfig);
```

## Files Generated

The exporter generates the following GTFS files:

- `agency.txt` - Transit agency information
- `routes.txt` - Transit routes
- `stops.txt` - Stop locations
- `shapes.txt` - Geographic shapes for routes
- `fare_attributes.txt` - Fare information
- `fare_rules.txt` - Rules for applying fares
- `afetacao.csv` - Custom zoning/allocation file
- `feed_info.txt` - Dataset metadata
- `calendar_dates.txt` - Service dates (TODO: needs new rules system)
- `trips.txt` - Trips for each route (TODO: needs new rules system)
- `stop_times.txt` - Times vehicles arrive at and depart from stops (TODO: needs new rules system)
