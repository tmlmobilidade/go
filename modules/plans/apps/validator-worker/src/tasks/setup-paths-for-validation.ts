import { getTmpWorkdirPath } from '@tmlmobilidade/files';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { join } from 'node:path';

export function setupPathsForValidation(gtfsValidation: GtfsValidation) {
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
