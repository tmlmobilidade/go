/* * */

import { RawApexTransactionBankingTapV40Schema } from '@/raw/banking-taps/banking-tap-v4-0.js';
import { RawApexTransactionInspectionDecisionV20Schema } from '@/raw/inspections/inspection-decision-v2-0.js';
import { RawApexTransactionInspectionV20Schema } from '@/raw/inspections/inspection-v2-0.js';
import { RawApexTransactionLocationV30Schema } from '@/raw/locations/location-v3-0.js';
import { RawApexTransactionRefundV30Schema } from '@/raw/sales/refund-v3-0.js';
import { RawApexTransactionSaleV30Schema } from '@/raw/sales/sale-v3-0.js';
import { RawApexTransactionValidationV20Schema } from '@/raw/validations/validation-v2-0.js';
import { RawApexTransactionValidationV30Schema } from '@/raw/validations/validation-v3-0.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionSchema = z.discriminatedUnion('version', [
	RawApexTransactionBankingTapV40Schema,
	RawApexTransactionInspectionDecisionV20Schema,
	RawApexTransactionInspectionV20Schema,
	RawApexTransactionLocationV30Schema,
	RawApexTransactionRefundV30Schema,
	RawApexTransactionSaleV30Schema,
	RawApexTransactionValidationV20Schema,
	RawApexTransactionValidationV30Schema,
]);

/**
 * Represents an APEX transaction entity, which is the PCGI wrapper
 * for the decoded transaction payload. The structure of `decodeValue`
 * is stored as a string and varies based on the type and version
 * of the enclosed APEX transaction.
 */
export type RawApexTransaction = z.infer<typeof RawApexTransactionSchema>;
