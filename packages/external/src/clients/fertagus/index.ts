/* * */

import { fertagusAuthClient } from './auth.js';
import { TrainsResponse } from './types.js';

/* * */

const BASE_URL = process.env.FERTAGUS_API_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing FERTAGUS_API_URL environment variable.');
	}

	const apiToken = await fertagusAuthClient.getToken();

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
	trains: '/trains',
} as const;

export const FertagusClient = Object.freeze({

	/**
	 * Gets the status of all Fertagus trains.
	 * @returns TrainsResponse object with the current status of all trains.
	 */
	trains: async (): Promise<TrainsResponse> => {
		const response = await fetcher(endpoints.trains);
		return await response.json() as TrainsResponse;
	},
}) satisfies Record<keyof typeof endpoints, (...args: any[]) => Promise<unknown>>;
