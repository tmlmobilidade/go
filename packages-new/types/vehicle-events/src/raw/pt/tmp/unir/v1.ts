/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmpUnirV1PayloadSchema = z.object({
	atrasoMaximo: z.number().nullable().default(null),
	atrasoMedio: z.number().nullable().default(null),
	avancoMaximo: z.number().nullable().default(null),
	avancoMedio: z.number().nullable().default(null),
	codigoPublicoLinha: z.string().nullable().default(null),
	codigoServico: z.string().nullable().default(null),
	codigoUltimaParagem: z.string().nullable().default(null),
	estado: z.string().nullable().default(null),
	estadoCumprimento: z.string().nullable().default(null),
	estaNaParagem: z.boolean().nullable().default(null),
	horaUltimoEvento: z.string().nullable().default(null),
	id: z.string(),
	instanteAtualizacao: z.string(),
	latitude: z.number().nullable().default(null),
	longitude: z.number().nullable().default(null),
	nomeLinha: z.string().nullable().default(null),
	nomeOperador: z.string().nullable().default(null),
	numAtrasos: z.number().nullable().default(null),
	numAvancos: z.number().nullable().default(null),
	numeroIdentificacaoVeiculo: z.string(),
	numEventos: z.number().nullable().default(null),
	numExcessosLatenciaChegadaPartidaParagem: z.number().nullable().default(null),
	numExcessosLatenciaInicioFimServico: z.number().nullable().default(null),
	numExcessosLatenciaLocalizacao: z.number().nullable().default(null),
	numTotalSaidasRota: z.number().nullable().default(null),
	operadorId: z.number(),
	recordedAtTime: z.string(),
	recordedProcessAtTime: z.string(),
	stopPointRef: z.string().nullable().default(null),
	temDadosCompletos: z.boolean(),
	vehicleAtStop: z.boolean().nullable().default(null),
	vehicleRef: z.string(),
	velocity: z.number().nullable().default(null),
});

export type RawVehicleEventPtTmpUnirV1Payload = z.infer<typeof RawVehicleEventPtTmpUnirV1PayloadSchema>;

/* * */

export const RawVehicleEventPtTmpUnirV1Schema = RawVehicleEventBaseSchema.extend({
	agency_id: z.union([
		z.literal('KJTOU'),
		z.literal('1H6XC'),
		z.literal('OP1VZ'),
		z.literal('VZAS3'),
		z.literal('8NDX4'),
	]),
	payload: RawVehicleEventPtTmpUnirV1PayloadSchema,
	version: z.literal('pt-tmp-unir-v1'),
});

export type RawVehicleEventPtTmpUnirV1 = z.infer<typeof RawVehicleEventPtTmpUnirV1Schema>;
