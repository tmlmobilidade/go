/* * */

import { z } from 'zod';

/* * */

export const ItrpSchema = z.object({
	agency_id: z.string(),
	pattern_id: z.string(),
	line_id: z.string(),
	route_id: z.string(),
	subtipo: z.string(),
	designacao: z.string(),
	sentido: z.string(),
	tipo_transporte: z.string(),
	origem_municipio: z.string(),
	origem_dtcc: z.string(),
	destino_municipio: z.string(),
	destino_dtcc: z.string(),
	classificacao: z.string(),
	extension_scheduled: z.number(),
	extension_observed: z.number(),
	circulations_scheduled: z.number(),
	circulations_observed: z.number(),
	veiculos_km_previsto: z.number(),
	veiculos_km_produzido: z.number(),
	passengers: z.number(),
	carreiras_servicos_1: z.number(),
	veiculos_km_1: z.number(),
	passageiros_1: z.number(),
	carreiras_servicos_2: z.number(),
	veiculos_km_2: z.number(),
	passageiros_2: z.number(),
	carreiras_servicos_3: z.number(),
	veiculos_km_3: z.number(),
	passageiros_3: z.number(),
	carreiras_servicos_PPM: z.number(),
	veiculos_km_PPM: z.number(),
	passageiros_PPM: z.number(),
	carreiras_servicos_PPT: z.number(),
	veiculos_km_PPT: z.number(),
	passageiros_PPT: z.number(),
	carreiras_servicos_CD: z.number(),
	veiculos_km_CD: z.number(),
	passageiros_CD: z.number(),
	carreiras_servicos_N: z.number(),
	veiculos_km_N: z.number(),
	passageiros_N: z.number(),
});

export type Itrp = z.infer<typeof ItrpSchema>;
