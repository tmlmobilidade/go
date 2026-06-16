/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionInspectionV20PayloadSchema = z.object({
	cardInfo: z.object({
		cardIssuer: z.number().nullable().default(null),
		cardNetworkID: z.string().nullable().default(null),
		cardNumber: z.number().nullable().default(null),
		cardPhysicalType: z.number(),
		cardSerialNumber: z.string(),
		cardTypeID: z.string(),
	}),
	controlInfo: z.object({
		calendarID: z.string().nullable().default(null),
		contractNumber: z.number(),
		contractStatusData: z.array(
			z.object({
				contractNumber: z.number(),
				contractStatus: z.number(),
			}),
		),
		controlStatus: z.number(),
		controlType: z.number(),
		environmentStatus: z.number(),
		productLongID: z.string().nullable().default(null),
		profilesUsedCount: z.number(),
		profilesUsedData: z.array(z.any()).default([]),
		spatialValidityLongID: z.string().nullable().default(null),
		tickLoadDate: z.string().nullable().default(null),
		tickLoadMachCode: z.number().nullable().default(null),
		tickLoadNumbDaily: z.number().nullable().default(null),
		validityPeriodID: z.string().nullable().default(null),
	}),
	controlServiceInfo: z.object({
		blockID: z.string().nullable().default(null),
		controlDestinationStopLongID: z.string(),
		controlerID: z.string(),
		controlOriginStopLongID: z.string(),
		dutyID: z.string().nullable().default(null),
		journeyID: z.string().nullable().default(null),
		lineLongID: z.string(),
		patternLongID: z.string(),
		vehicleID: z.number(),
		zoneLongID: z.string().nullable().default(null),
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
	signedData: z.object({
		contractBinaryRead: z.string().nullable().default(null),
		environmentBinaryRead: z.string().nullable().default(null),
		raw: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.literal(15),
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

export type RawApexTransactionInspectionV20Payload = z.infer<typeof RawApexTransactionInspectionV20PayloadSchema>;

/* * */

export const RawApexTransactionInspectionV20Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionInspectionV20PayloadSchema,
	version: z.literal('inspection-2.0'),
});

export type RawApexTransactionInspectionV20 = z.infer<typeof RawApexTransactionInspectionV20Schema>;
