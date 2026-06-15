/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionLocationV30PayloadSchema = z.object({
	countersInfo: z.object({
		countersTransactionContext: z.number(),
		paperSaleAckCounter: z.number(),
		paperSaleCounter: z.number(),
		validationCounter: z.number(),
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
		apexTransactionType: z.number(),
		apexTransactionVersion: z.literal('3.0'),
		transactionDate: z.string(),
		transactionGroupId: z.string(),
		transactionId: z.string(),
	}),
	validationServiceInfo: z.object({
		blockID: z.string(),
		dutyID: z.string(),
		journeyID: z.string(),
		lineLongID: z.string(),
		onBehalfOfOperatorLongID: z.string(),
		outOfBoundsType: z.number(),
		patternLongID: z.string(),
		stopLongID: z.string(),
		validatorID: z.number(),
		vehicleID: z.number(),
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

export type RawApexTransactionLocationV30Payload = z.infer<typeof RawApexTransactionLocationV30PayloadSchema>;

/* * */

export const RawApexTransactionLocationV30Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionLocationV30PayloadSchema,
	version: z.literal('apex-location-3.0'),
});

export type RawApexTransactionLocationV30 = z.infer<typeof RawApexTransactionLocationV30Schema>;
