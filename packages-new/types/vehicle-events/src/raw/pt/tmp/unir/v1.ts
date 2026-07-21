/* * */

import { RawVehicleEventBaseSchema } from '@/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventPtTmpUnirV1PayloadSchema = z.object({
	atrasoMaximo: z.number(),
	atrasoMedio: z.number(),
	avancoMaximo: z.number(),
	avancoMedio: z.number(),
	codigoPublicoLinha: z.string(),
	codigoServico: z.string(),
	codigoUltimaParagem: z.string(),
	estado: z.string(),
	estadoCumprimento: z.string(),
	estaNaParagem: z.boolean(),
	horaUltimoEvento: z.string(),
	id: z.string(),
	instanteAtualizacao: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	nomeLinha: z.string(),
	nomeOperador: z.string(),
	numAtrasos: z.number(),
	numAvancos: z.number(),
	numeroIdentificacaoVeiculo: z.string(),
	numEventos: z.number(),
	numExcessosLatenciaChegadaPartidaParagem: z.number(),
	numExcessosLatenciaInicioFimServico: z.number(),
	numExcessosLatenciaLocalizacao: z.number(),
	numTotalSaidasRota: z.number(),
	operadorId: z.number(),
	recordedAtTime: z.string(),
	recordedProcessAtTime: z.string(),
	stopPointRef: z.string(),
	temDadosCompletos: z.boolean(),
	vehicleAtStop: z.boolean(),
	vehicleRef: z.string(),
	velocity: z.number(),
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
