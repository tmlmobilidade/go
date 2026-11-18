import { StopIdSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

export const PatternsResolveZonesRequestSchema = z.object({ stop_ids: z.array(StopIdSchema).max(10000) });
export const PatternsResolveZonesResponseSchema = z.record(z.array(z.string()));

export type PatternsResolveZonesRequest = z.infer<typeof PatternsResolveZonesRequestSchema>;
export type PatternsResolveZonesResponse = z.infer<typeof PatternsResolveZonesResponseSchema>;
