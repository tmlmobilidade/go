/* * */

import { UnirVehicleLocationResponse } from './types.js';

/* * */

const BASE_URL = process.env.UNIR_API_URL;
const API_KEY = process.env.UNIR_API_KEY;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing UNIR_API_URL environment variable.');
	}
	if (!API_KEY) {
		throw new Error('Missing UNIR_API_KEY environment variable.');
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		headers: {
			'api-key': API_KEY,
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

/* * */

const endpoints = {
	vehiclePositions: '/amp/api-sa/localizacoes-veiculos-direto',
} as const;

export const UnirClient = Object.freeze({

	/**
	 * Fetches vehicle locations from the Unir API.
	 *
	 * @returns {Promise<UnirVehicleLocationResponse>} A promise that resolves with the vehicle locations response.
	 */
	vehiclePositions: async (): Promise<UnirVehicleLocationResponse> => {
		const response = await fetcher(endpoints.vehiclePositions);
		return await response.json() as UnirVehicleLocationResponse;
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
