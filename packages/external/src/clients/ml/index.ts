/* * */

import { ServiceAlertResponse } from '@tmlmobilidade/types';

import { mlAuthClient } from './auth.js';
import { BaseResponse, EstadoLinha, InfoEstacao, TempoEspera } from './types.js';

/* * */

const BASE_URL = process.env.ML_API_URL;
const ALERTS_URL = process.env.ML_ALERTS_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing ML_API_URL environment variable.');
	}

	const apiToken = await mlAuthClient.getToken();

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${apiToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

/* * */

const endpoints = {
	estadoLinha: (linha: string) => `/estadoLinha/${linha}`,
	estadoLinhaTodas: '/estadoLinha/todos',
	infoEstacao: (estacao: string) => `/infoEstacao/${estacao}`,
	infoEstacaoTodas: '/infoEstacao/todos',
	serviceAlerts: ALERTS_URL,
	tempoEsperaEstacao: (estacao: string) => `/tempoEspera/Estacao/${estacao}`,
	tempoEsperaLinha: (linha: string) => `/tempoEspera/Linha/${linha}`,
	tempoEsperaTodasEstacoes: '/tempoEspera/Estacao/todos',
} as const;

export const MlClient = Object.freeze({

	/**
	 * Gets the status of a specific Metro Lisboa line.
	 * @param linha Line identifier as string.
	 * @returns EstadoLinha object with the current status of the line.
	 */
	estadoLinha: async (linha: string): Promise<BaseResponse<EstadoLinha>> => {
		const response = await fetcher(endpoints.estadoLinha(linha));
		return await response.json() as BaseResponse<EstadoLinha>;
	},

	/**
	 * Gets the status of all Metro Lisboa lines.
	 * @returns An array of EstadoLinha objects, each representing the status of a line.
	 */
	estadoLinhaTodas: async (): Promise<BaseResponse<EstadoLinha[]>> => {
		const response = await fetcher(endpoints.estadoLinhaTodas);
		return await response.json() as BaseResponse<EstadoLinha[]>;
	},

	/**
	 * Gets information about a specific Metro Lisboa station.
	 * @param estacao Station identifier as string.
	 * @returns InfoEstacao object with details about the station.
	 */
	infoEstacao: async (estacao: string): Promise<BaseResponse<InfoEstacao>> => {
		const response = await fetcher(endpoints.infoEstacao(estacao));
		return await response.json() as BaseResponse<InfoEstacao>;
	},

	/**
	 * Gets information about all Metro Lisboa stations.
	 * @returns An array of InfoEstacao objects, one for each station.
	 */
	infoEstacaoTodas: async (): Promise<BaseResponse<InfoEstacao[]>> => {
		const response = await fetcher(endpoints.infoEstacaoTodas);
		return await response.json() as BaseResponse<InfoEstacao[]>;
	},

	/**
	 * Retrieves current Metro Lisboa service alerts.
	 * @returns A ServiceAlertResponse containing the active service alerts in GTFS-realtime format.
	 */
	serviceAlerts: async (): Promise<BaseResponse<ServiceAlertResponse>> => {
		const response = await fetcher(endpoints.serviceAlerts);
		return await response.json() as BaseResponse<ServiceAlertResponse>;
	},

	/**
	 * Gets the current waiting time estimates for a specific station.
	 * @param estacao Station identifier as string.
	 * @returns TempoEspera object with estimated waiting times for the station.
	 */
	tempoEsperaEstacao: async (estacao: string): Promise<BaseResponse<TempoEspera>> => {
		const response = await fetcher(endpoints.tempoEsperaEstacao(estacao));
		return await response.json() as BaseResponse<TempoEspera>;
	},

	/**
	 * Gets the current waiting time estimates for a specific line.
	 * @param linha Line identifier as string.
	 * @returns An array of TempoEspera objects, one for each station in the line.
	 */
	tempoEsperaLinha: async (linha: string): Promise<BaseResponse<TempoEspera[]>> => {
		const response = await fetcher(endpoints.tempoEsperaLinha(linha));
		return await response.json() as BaseResponse<TempoEspera[]>;
	},

	/**
	 * Gets the current waiting time estimates for all stations.
	 * @returns An array of TempoEspera objects, one for each station.
	 */
	tempoEsperaTodasEstacoes: async (): Promise<BaseResponse<TempoEspera[]>> => {
		const response = await fetcher(endpoints.tempoEsperaTodasEstacoes);
		return await response.json() as BaseResponse<TempoEspera[]>;
	},

}) satisfies Record<keyof typeof endpoints, (...args: any[]) => Promise<unknown>>;
