import { getRequiredEnv } from '../lib/get-required-env.js';
import { STATUS_TIMEOUT_MS } from '../types/consts.js';
import { PDFStatus } from '../types/interfaces.js';
import { generateToken } from './generate-token.js';

/**
* Gets the status of a PDF generation in the API.
*/
export async function getPDFStatus(id: string): Promise<PDFStatus> {
	//

	//
	// A. Send the request to the API

	const accessToken = await generateToken();
	const response = await fetch(getRequiredEnv('ZPHERES_SVG_STATUS_URL').replace(':id', id), {
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'ob2zphrs-customer': getRequiredEnv('OB_CUSTOMER'),
			'ob2zphrs-user': getRequiredEnv('OB_USER'),
		},
		signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
	});

	if (!response.ok) {
		const responseBody = await response.text();
		throw new Error(`PDF status failed (${response.status}): ${responseBody.slice(0, 1_000)}`);
	}

	//
	// C. Read the response body

	const responseData: unknown = await response.json();

	if (!responseData || typeof responseData !== 'object') {
		throw new Error('PDF status response is missing a valid status.');
	}

	//
	// D. Extract the download link and status from the response body

	const { downloadLink, status } = responseData as Record<string, unknown>;

	if (typeof status !== 'string') {
		throw new Error('PDF status response is missing a valid status.');
	}

	if (downloadLink !== undefined && typeof downloadLink !== 'string') {
		throw new Error('PDF status response has an invalid download URL.');
	}

	//
	// E. Return the PDF status

	return {
		...responseData,
		downloadLink: typeof downloadLink === 'string' ? downloadLink : undefined,
		status,
	};
}
