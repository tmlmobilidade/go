/* * */

import { RawApexTransactionValidationV20Schema } from '@/raw/validations/validation-v20.js';
import { RawApexTransactionValidationV30Schema } from '@/raw/validations/validation-v30.js';
import { RawApexTransactionValidationV40Schema } from '@/raw/validations/validation-v40.js';
import { RawApexTransactionValidationV50Schema } from '@/raw/validations/validation-v50.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionValidationSchema = z.discriminatedUnion('version', [
	RawApexTransactionValidationV20Schema,
	RawApexTransactionValidationV30Schema,
	RawApexTransactionValidationV40Schema,
	RawApexTransactionValidationV50Schema,
]);

/**
 * Represents an APEX validation entity, which is a transaction
 * that contains validation data. The structure of the validation data
 * varies based on the version of the transaction.
 */
export type RawApexTransactionValidation = z.infer<typeof RawApexTransactionValidationSchema>;
