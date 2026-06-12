/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionInspectionDecisionV20PayloadSchema = z.object({
	controlAckInfo: z.object({
		corrControlTransactionID: z.string(),
		finalControlStatus: z.number(),
	}),
	mac: z.object({
		aseCounterValue: z.number(),
		binaryDataMask: z.number(),
		fullMacFlag: z.number(),
		interruptedStatus: z.number(),
		macVersion: z.number(),
		raw: z.string(),
		samModel: z.number(),
		samSerialNumber: z.number(),
		samTypeVersion: z.number(),
		samWorkingMode: z.number(),
		transactionCounter: z.number(),
	}),
	operatorInfo: z.object({
		channelID: z.string(),
		deviceID: z.string(),
		networkID: z.string(),
		operatorLongID: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.literal(16),
		apexTransactionVersion: z.string(),
		transactionDate: z.string(),
		transactionGroupId: z.string(),
		transactionId: z.string(),
	}),
	versionInfo: z.object({
		actionListsVersion: z.string(),
		apexVersion: z.string(),
		commercialOfferVersion: z.string(),
		networkVersion: z.string(),
		technicalParametersVersion: z.string(),
		vivaVersion: z.string(),
	}),
});

export type RawApexTransactionInspectionDecisionV20Payload = z.infer<typeof RawApexTransactionInspectionDecisionV20PayloadSchema>;

/* * */

export const RawApexTransactionInspectionDecisionV20Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionInspectionDecisionV20PayloadSchema,
	version: z.literal('inspection-decision-2.0'),
});

export type RawApexTransactionInspectionDecisionV20 = z.infer<typeof RawApexTransactionInspectionDecisionV20Schema>;
