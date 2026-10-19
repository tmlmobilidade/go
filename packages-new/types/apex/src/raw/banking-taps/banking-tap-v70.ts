/* * */

import { z } from 'zod';

import { RawApexTransactionBaseSchema } from '../raw-apex-transaction-base.js';

/* * */

export const RawApexTransactionBankingTapV70PayloadSchema = z.object({
	cardInfo: z.object({
		cardPhysicalType: z.number(),
		cardTypeID: z.string(),
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
	serviceInfo: z.object({
		blockID: z.string().nullable().default(null),
		dutyID: z.string().nullable().default(null),
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
		destinationStopId: z.string().nullable().default(null),
		eventType: z.number().nullable().default(null),
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

export type RawApexTransactionBankingTapV70Payload = z.infer<typeof RawApexTransactionBankingTapV70PayloadSchema>;

/* * */

export const RawApexTransactionBankingTapV70Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionBankingTapV70PayloadSchema,
	version: z.literal('banking-tap-7.0'),
});

export type RawApexTransactionBankingTapV70 = z.infer<typeof RawApexTransactionBankingTapV70Schema>;
