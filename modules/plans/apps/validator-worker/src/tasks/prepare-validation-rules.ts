import { normalizeValidationRules } from '@/utils/normalize-rules/normalize-rules.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/** Writes the agency rules, completed with shared defaults, for the Go validator. */
export async function prepareValidationRules(gtfsValidation: GtfsValidation, rulesPath: string) {
	const foundAgency = await goDb.core.agencies.findById(gtfsValidation.agency_id);
	if (!foundAgency) throw new Error(`Agency not found: ${gtfsValidation.agency_id}`);

	const normalizedRules = normalizeValidationRules(foundAgency.validation_rules);
	fs.writeFileSync(rulesPath, JSON.stringify(normalizedRules), { encoding: 'utf-8' });

	Logger.info({ message: `Normalized validation rules saved to: ${rulesPath}` });
}
