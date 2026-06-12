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
import { parseRawApexTransactionValidationV50 } from '@/from-raw-to-simplified/validations/validation-v50.js';
import { type AnySimplifiedApex, type RawApexTransaction } from '@tmlmobilidade/go-types-apex';

/* * */

export const fromRawToSimplifiedMap: Record<RawApexTransaction['version'], (apexTransaction: RawApexTransaction) => AnySimplifiedApex | null> = {
	'banking-tap-4.0': parseRawApexTransactionBankingTapV40,
	'inspection-2.0': parseRawApexTransactionInspectionV20,
	'inspection-decision-2.0': parseRawApexTransactionInspectionDecisionV20,
	'location-3.0': parseRawApexTransactionLocationV30,
	'refund-3.0': parseRawApexTransactionRefundV30,
	'sale-3.0': parseRawApexTransactionSaleV30,
	'validation-2.0': parseRawApexTransactionValidationV20,
	'validation-3.0': parseRawApexTransactionValidationV30,
	'validation-4.0': parseRawApexTransactionValidationV40,
	'validation-5.0': parseRawApexTransactionValidationV50,
};
