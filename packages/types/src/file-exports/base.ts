/* * */

import { DocumentSchema, ProcessingStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const FileExportTypes = ['gtfs', 'ride', 'sams_analysis', 'stop', 'zone', 'vehicle'] as const;
export const FileExportTypeSchema = z.enum(FileExportTypes);
export type FileExportType = z.infer<typeof FileExportTypeSchema>;

/* * */

export const FileExportBaseSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		file_id: z.string().nullish(),
		file_name: z.string(),
		processing_status: ProcessingStatusSchema,
		properties: z.record(z.any()),
		type: FileExportTypeSchema,
	});

export const CreateFileExportSchema = FileExportBaseSchema.omit({ _id: true, created_at: true, updated_at: true }).partial();
export const UpdateFileExportSchema = CreateFileExportSchema.partial();

export type UpdateFileExport = z.infer<typeof UpdateFileExportSchema>;
export type CreateFileExportDto<T extends { properties: Record<string, unknown>, type: string }> = Omit<z.infer<typeof FileExportBaseSchema>, '_id' | 'created_at' | 'file_id' | 'processing_status' | 'updated_at'> & {
	file_id: null
	processing_status?: 'waiting'
	properties: T['properties']
	type: T['type']
};
