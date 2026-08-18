import { getTmpWorkdirPath } from '@tmlmobilidade/files';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { join } from 'node:path';

/**
 * Creates the isolated input, rules, and result paths for one validation run.
 * @param gtfsValidation - The validation record.
 * @returns The paths for the validation run.
 */
export function setupPathsForValidation(gtfsValidation: GtfsValidation) {
	//

	// getTmpWorkdirPath creates a unique directory, which prevents filename
	// collisions when multiple worker instances process validations.
	const tempWorkdirPath = getTmpWorkdirPath(null, true);

	const gtfsFilePath = join(tempWorkdirPath, `${gtfsValidation.file_id}.zip`);
	const gtfsValidationRulesPath = join(tempWorkdirPath, `rules_${gtfsValidation._id}.json`);
	const gtfsValidationResultPath = join(tempWorkdirPath, `result_${gtfsValidation._id}.json`);

	return {
		gtfsFilePath,
		gtfsValidationResultPath,
		gtfsValidationRulesPath,
		tempWorkdirPath,
	};
}
