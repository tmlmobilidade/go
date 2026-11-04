/* * */

import { Files } from '@tmlmobilidade/go-utils-files';

import { type AmiVehiclePosition } from './types.js';

/* * */

export const AmiClient = Object.freeze({
	//

	/**
	 * Fetches vehicle positions from the AMI WS_TRACK API, preserving source CSV values.
	 *
	 * @param companyId The AMI company identifier.
	 * @returns {Promise<AmiVehiclePosition[]>} A promise that resolves with the vehicle positions.
	 */
	vehiclePositions: async (companyId: number): Promise<AmiVehiclePosition[]> => {
		//

		//
		// Validate the API configuration and company identifier

		const baseUrl = process.env.AMI_API_URL;
		const token = process.env.AMI_API_TOKEN;

		if (!baseUrl) {
			throw new Error('Missing AMI_API_URL environment variable.');
		}
		if (!token) {
			throw new Error('Missing AMI_API_TOKEN environment variable.');
		}
		if (!Number.isInteger(companyId) || companyId <= 0) {
			throw new Error('Invalid AMI company ID.');
		}

		//
		// Fetch the vehicle positions for the requested company

		const url = new URL(`${baseUrl.replace(/\/$/, '')}/api/track/getbuspositions`);
		url.searchParams.set('companyId', String(companyId));

		const response = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
			},
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			throw new Error(`AMI request failed (${response.status}): ${response.statusText}`);
		}

		//
		// Parse the semicolon-delimited vehicle positions feed

		return Files.parseCsv<AmiVehiclePosition>(await response.text(), {
			delimiter: ';',
			header: true,
			skipEmptyLines: 'greedy',
		});
	},
});
