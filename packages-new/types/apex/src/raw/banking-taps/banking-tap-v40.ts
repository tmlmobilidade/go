/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionBankingTapV40PayloadSchema = z.object({
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
	serviceInfo: z.object({
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
	tapInInfo: z.object({
		bankingTapID: z.string(),
		bankingToken: z.string(),
		cardBrand: z.number(),
		cardPan: z.string(),
		groupDimension: z.number(),
		productLongID: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.literal(20),
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

export type RawApexTransactionBankingTapV40Payload = z.infer<typeof RawApexTransactionBankingTapV40PayloadSchema>;

/* * */

export const RawApexTransactionBankingTapV40Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionBankingTapV40PayloadSchema,
	version: z.literal('apex-banking-tap-4.0'),
});

export type RawApexTransactionBankingTapV40 = z.infer<typeof RawApexTransactionBankingTapV40Schema>;
