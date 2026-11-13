import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'fs';
import path from 'path';

import { getRequiredEnv } from '../lib/get-required-env.js';
import parametersConfig from '../parameters.json' with { type: 'json' };
import { GENERATE_TIMEOUT_MS } from '../types/consts.js';
import { ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { generateToken } from './generate-token.js';

/**
* Creates a new poster in the API.
*/
export async function generatePDF(exportConfig: ExportHitouchConfig): Promise<string> {
	//

	//
	// A. Generate a new access token

	const accessToken = await generateToken();
	const gtfsZipPath = path.resolve(exportConfig.workdir, exportConfig.output);

	//
	// B. Verify the HiTouch ZIP file exists and is not empty

	if (!fs.existsSync(gtfsZipPath)) {
		throw new Error(`HiTouch ZIP file does not exist: ${gtfsZipPath}`);
	}

	//
	// C. Verify the HiTouch ZIP file is not empty

	const gtfsZipSize = fs.statSync(gtfsZipPath).size;

	if (gtfsZipSize === 0) {
		throw new Error(`HiTouch ZIP file is empty: ${gtfsZipPath}`);
	}

	//
	// D. Read the HiTouch ZIP file and parameters

	const gtfsZip = await fs.promises.readFile(gtfsZipPath);
	const parameters = JSON.stringify(parametersConfig);

	const body = new FormData();

	//
	// E. Append the HiTouch ZIP file and parameters to the request body

	body.append('gtfs.zip', new File([new Uint8Array(gtfsZip)], path.basename(gtfsZipPath), { type: 'application/zip' }));
	body.append('parameters.json', new File([parameters], 'parameters.json', { type: 'application/json' }));

	//
	// F. Send the request to the API

	Logger.info({ message: `Uploading HiTouch ZIP (${gtfsZipSize} bytes) to ZPHERES.` });

	const response = await fetch(getRequiredEnv('ZPHERES_GENERATE_SVG_URL'), {
		body,
		duplex: 'half',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'ob2zphrs-customer': getRequiredEnv('OB_CUSTOMER'),
			'ob2zphrs-user': getRequiredEnv('OB_USER'),
		},
		method: 'POST',
		signal: AbortSignal.timeout(GENERATE_TIMEOUT_MS),
	});

	Logger.info({ message: `ZPHERES generate responded with ${response.status}.` });

	if (!response.ok) {
		const responseBody = await response.text();

		throw new Error(`PDF generation failed (${response.status}): ${responseBody.slice(0, 1_000)}`);
	}

	//
	// G. Extract the PDF ID from the response headers

	const location = response.headers.get('location');
	const match = location?.match(/\/api\/svg\/([^?#/]+)/);
	const pdfId = match ? match[1] : null;

	if (!pdfId) {
		throw new Error('PDF response has an invalid location header: ' + (location ?? 'missing'));
	}

	//
	// H. Return the PDF ID

	return pdfId;
}
