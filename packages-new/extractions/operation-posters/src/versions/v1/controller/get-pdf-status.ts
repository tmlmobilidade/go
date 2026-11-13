import { generateToken } from './generate-token.js';
import { getRequiredEnv } from './get-required-env.js';

const STATUS_TIMEOUT_MS = 30_000;

export interface PDFStatus {
	[key: string]: unknown
	downloadLink?: string
	status: string
}

/**
	 * Gets the status of a PDF generation in the API.
	 */
export async function getPDFStatus(id: string): Promise<PDFStatus> {
	//

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

	const responseData: unknown = await response.json();

	if (!responseData || typeof responseData !== 'object') {
		throw new Error('PDF status response is missing a valid status.');
	}

	const { downloadLink, status } = responseData as Record<string, unknown>;

	if (typeof status !== 'string') {
		throw new Error('PDF status response is missing a valid status.');
	}

	if (downloadLink !== undefined && typeof downloadLink !== 'string') {
		throw new Error('PDF status response has an invalid download URL.');
	}

	return {
		...responseData,
		downloadLink: typeof downloadLink === 'string' ? downloadLink : undefined,
		status,
	};
}
