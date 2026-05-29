/* * */

import { gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/* * */

interface PreRequestStopsOptions {
	agencyId: string
	outputPath: string
}

interface PreRequestStopsResult {
	outputPath: string
	totalStops: number
}

/* * */

export async function preRequestStops({ agencyId, outputPath }: PreRequestStopsOptions): Promise<PreRequestStopsResult> {
	const foundStops = await gtfsValidations.findStopsForValidation(agencyId);
	const stopsContent = JSON.stringify(foundStops);

	fs.writeFileSync(outputPath, stopsContent, { encoding: 'utf-8' });

	Logger.info(`Pre-rendered ${foundStops.length} stops to: ${outputPath}`);

	return {
		outputPath,
		totalStops: foundStops.length,
	};
}
