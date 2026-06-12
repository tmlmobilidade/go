/* * */

import { parseRawApexTransactionBankingTapV40 } from '@/from-raw-to-simplified/banking-taps/banking-tap-v40.js';
import { parseRawApexTransactionInspectionDecisionV20 } from '@/from-raw-to-simplified/inspections/inspection-decision-v20.js';
import { parseRawApexTransactionInspectionV20 } from '@/from-raw-to-simplified/inspections/inspection-v20.js';
import { parseRawApexTransactionLocationV30 } from '@/from-raw-to-simplified/locations/location-v30.js';
import { parseRawApexTransactionRefundV30 } from '@/from-raw-to-simplified/sales/refund-v30.js';
import { parseRawApexTransactionSaleV30 } from '@/from-raw-to-simplified/sales/sale-v30.js';
import { parseRawApexTransactionValidationV20 } from '@/from-raw-to-simplified/validations/validation-v20.js';
import { parseRawApexTransactionValidationV30 } from '@/from-raw-to-simplified/validations/validation-v30.js';
import { parseRawApexTransactionValidationV40 } from '@/from-raw-to-simplified/validations/validation-v40.js';
import { type AnySimplifiedApex, type RawApexTransaction } from '@tmlmobilidade/go-types-apex';

/* * */

export const fromRawToSimplifiedMap: Record<RawApexTransaction['version'], (apexTransaction: RawApexTransaction) => AnySimplifiedApex | null> = {
	'apex-banking-tap-4.0': parseRawApexTransactionBankingTapV40,
	'apex-inspection-2.0': parseRawApexTransactionInspectionV20,
	'apex-inspection-decision-2.0': parseRawApexTransactionInspectionDecisionV20,
	'apex-location-3.0': parseRawApexTransactionLocationV30,
	'apex-refund-3.0': parseRawApexTransactionRefundV30,
	'apex-sale-3.0': parseRawApexTransactionSaleV30,
	'apex-validation-2.0': parseRawApexTransactionValidationV20,
	'apex-validation-3.0': parseRawApexTransactionValidationV30,
	'apex-validation-4.0': parseRawApexTransactionValidationV40,
};
