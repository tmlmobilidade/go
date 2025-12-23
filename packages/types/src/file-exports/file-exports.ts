/* * */

import { RideExportSchema } from '@/file-exports/ride-export.js';
import { z } from 'zod';

/* * */

export const FileExportSchema = z.discriminatedUnion('type', [
	RideExportSchema,
]);

export type FileExport = z.infer<typeof FileExportSchema>;
