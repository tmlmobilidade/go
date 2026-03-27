/* * */

import { parseRawApexTransactionBankingTapV40 } from '@/banking-taps/banking-tap-v40.js';
import { parseRawApexTransactionInspectionDecisionV20 } from '@/inspections/inspection-decision-v20.js';
import { parseRawApexTransactionInspectionV20 } from '@/inspections/inspection-v20.js';
import { parseRawApexTransactionLocationV30 } from '@/locations/location-v30.js';
import { parseRawApexTransactionValidationV20 } from '@/validations/validation-v20.js';
import { parseRawApexTransactionValidationV30 } from '@/validations/validation-v30.js';
import { type AnySimplifiedApex, type RawApexTransaction } from '@tmlmobilidade/types';

/* * */

export const PARSER_MAP: Record<RawApexTransaction['version'], (apexTransaction: RawApexTransaction) => AnySimplifiedApex | null> = {
	'apex-banking-tap-4.0': parseRawApexTransactionBankingTapV40,
	'apex-inspection-2.0': parseRawApexTransactionInspectionV20,
	'apex-inspection-decision-2.0': parseRawApexTransactionInspectionDecisionV20,
	'apex-location-3.0': parseRawApexTransactionLocationV30,
	'apex-refund-3.0': () => null,
	'apex-sale-3.0': () => null,
	'apex-validation-2.0': parseRawApexTransactionValidationV20,
	'apex-validation-3.0': parseRawApexTransactionValidationV30,
};
