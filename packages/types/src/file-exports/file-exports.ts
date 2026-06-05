/* * */

import { GtfsExportSchema } from '@/file-exports/gtfs-export.js';
import { RideExportSchema } from '@/file-exports/ride-export.js';
import { SamsAnalysisExportSchema } from '@/file-exports/sams-analysis-export.js';
import { StopExportSchema } from '@/file-exports/stop-export.js';
import { VehicleExportSchema } from '@/file-exports/vehicle-export.js';
import { z } from 'zod';

/* * */

export const FileExportSchema = z.discriminatedUnion('type', [
	GtfsExportSchema,
	RideExportSchema,
	SamsAnalysisExportSchema,
	StopExportSchema,
	VehicleExportSchema,
]);

export type FileExport = z.infer<typeof FileExportSchema>;
