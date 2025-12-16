/* * */

import { DocumentSchema } from '@/_common/document.js';
import { ProcessingStatusSchema } from '@/_common/status.js';
import { z } from 'zod';

export const FILE_EXPORT_TYPES = ['ride'] as const;
export const FileExportTypeSchema = z.enum(FILE_EXPORT_TYPES);
export type FileExportType = z.infer<typeof FileExportTypeSchema>;

/* * */

export const FileExportBaseSchema = DocumentSchema.extend({
	file_id: z.string().nullish(),
	file_name: z.string(),
	processing_status: ProcessingStatusSchema,
	properties: z.record(z.any()),
	type: FileExportTypeSchema,
});

export const UpdateFileExportSchema = FileExportBaseSchema.omit({ _id: true, created_at: true, created_by: true, properties: true, type: true, updated_at: true }).partial();

export type UpdateFileExport = z.infer<typeof UpdateFileExportSchema>;
export type CreateFileExportDto<T extends { properties: Record<string, unknown>, type: string }> = Omit<z.infer<typeof FileExportBaseSchema>, '_id' | 'created_at' | 'file_id' | 'processing_status' | 'updated_at'> & {
	file_id: null
	processing_status?: 'waiting'
	properties: T['properties']
	type: T['type']
};
