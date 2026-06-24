/* * */

import { DocumentSchema } from '@/_common/document.js';
import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { PlanAppStatusSchema } from '@/plans/plan-app-status.js';
import { PlanPcgiLegacySchema } from '@/plans/plan-pcgi-legacy.js';
import { z } from 'zod';

/* * */

const PlanStatsSheetSchema = <T extends z.ZodTypeAny>(rowSchema: T) => z.object({
	rows: z.array(rowSchema),
});

const PlanStatsExtensionPerMunicipalityRowSchema = z.object({
	'Area': z.string(),
	'Concelho': z.string(),
	'extension_%': z.string(),
	'extension_km': z.string(),
	'pattern_id': z.string(),
	'total_extension_%': z.string(),
	'total_extension_km': z.string(),
});

const PlanStatsExtensionPerMunicipalityRedistRowSchema = PlanStatsExtensionPerMunicipalityRowSchema.extend({
	redistribuicao: z.enum(['Não', 'Sim']),
});

const PlanStatsParagensProMunicipioRowSchema = z.record(z.string());

const PlanStatsIndice5050RowSchema = z.object({
	'Area': z.string(),
	'Concelho': z.string(),
	'extension_%': z.string(),
	'Indice_50_50': z.string(),
	'pattern_id': z.string(),
	'stops_%': z.string(),
});

const PlanStatsIndice5050XVeicKmRowSchema = z.object({
	Area: z.string(),
	Concelho: z.string(),
	Indice_50_50: z.string(),
	pattern_id: z.string(),
	Valor_50_50_x_veic_km: z.string(),
	veic_km_total: z.string(),
});

const PlanStatsVkmPorMunicipioRowSchema = z.object({
	Concelho: z.string(),
	VKM_total: z.string(),
});

const PlanStatsInputsUsadosRowSchema = z.object({
	Resumo: z.string(),
});

const PlanStatsTesteRowSchema = z.object({
	annual_circulations: z.string(),
	Area: z.string(),
	day_type: z.string(),
	extension_km: z.string(),
	nota: z.string(),
	num_dates: z.string(),
	num_trip_ids: z.string(),
	num_trips: z.string(),
	pattern_id: z.string(),
	period: z.string(),
	row_type: z.enum(['circulation_group', 'pattern_summary']),
	runs: z.string(),
	service_id: z.string(),
	veic_km_total: z.string(),
});

export const PlanStatsSchema = z.object({
	extension_per_municipality: PlanStatsSheetSchema(PlanStatsExtensionPerMunicipalityRowSchema),
	extension_per_municipality_redist: PlanStatsSheetSchema(PlanStatsExtensionPerMunicipalityRedistRowSchema),
	indice_50_50: PlanStatsSheetSchema(PlanStatsIndice5050RowSchema),
	indice_50_50_x_veic_km: PlanStatsSheetSchema(PlanStatsIndice5050XVeicKmRowSchema),
	inputs_usados: PlanStatsSheetSchema(PlanStatsInputsUsadosRowSchema),
	paragens_pro_municipio: PlanStatsSheetSchema(PlanStatsParagensProMunicipioRowSchema),
	teste: PlanStatsSheetSchema(PlanStatsTesteRowSchema),
	vkm_p_municipio: PlanStatsSheetSchema(PlanStatsVkmPorMunicipioRowSchema),
});

/* * */

export const PlanSchema = DocumentSchema.extend({
	apps: z.object({
		controller: PlanAppStatusSchema,
		merger: PlanAppStatusSchema,
	}).default({}),
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	hash: z.string(),
	is_locked: z.boolean().default(false),
	operation_file_id: z.string(),
	pcgi_legacy: PlanPcgiLegacySchema,
	plan_stats: PlanStatsSchema.nullable().default(null),
});

export const CreatePlanSchema = PlanSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdatePlanSchema = CreatePlanSchema.omit({ created_by: true }).partial();

/* * */

export type Plan = z.infer<typeof PlanSchema>;
export type PlanStats = z.infer<typeof PlanStatsSchema>;
export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;

/* * */

export interface HashablePlanMetadata {
	_id: Plan['_id']
	gtfs_agency: Plan['gtfs_agency']
	gtfs_feed_info: Plan['gtfs_feed_info']
	operation_file_id: Plan['operation_file_id']
}
