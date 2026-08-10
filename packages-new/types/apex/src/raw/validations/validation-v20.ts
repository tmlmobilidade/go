/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionValidationV20PayloadSchema = z.object({
	cardInfo: z.object({
		cardIssuer: z.number(),
		cardNetworkID: z.string(),
		cardNumber: z.number(),
		cardPhysicalType: z.number(),
		cardSerialNumber: z.string(),
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
		journeyID: z.string().nullable().default(null),
		lineLongID: z.string(),
		patternLongID: z.string(),
		stopLongID: z.string(),
		validatorID: z.number(),
		vehicleID: z.number(),
		zoneLongID: z.string().nullable().default(null),
	}),
	signedData: z.object({
		contractBinaryRead: z.string(),
		eventBinaryRead: z.string(),
		eventBinaryWritten: z.string(),
		raw: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.number(),
		apexTransactionVersion: z.literal('2.0'),
		transactionDate: z.string(),
		transactionGroupId: z.string(),
		transactionId: z.string(),
	}),
	validationInfo: z.object({
		calendarID: z.string(),
		contractNumber: z.number(),
		eventType: z.number(),
		greylistItemsData: z.array(z.any()),
		productLongID: z.string(),
		profilesUsedData: z.array(z.any()),
		spatialValidityLongID: z.string(),
		tickLoadDate: z.string(),
		tickLoadMachCode: z.number(),
		tickLoadNumbDaily: z.number(),
		unitsQuantity: z.number().nullable().default(null),
		unitsRemaining: z.number().nullable().default(null),
		validationStatus: z.number(),
		validationType: z.number(),
		validityPeriodID: z.string(),
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

export type RawApexTransactionValidationV20Payload = z.infer<typeof RawApexTransactionValidationV20PayloadSchema>;

/* * */

export const RawApexTransactionValidationV20Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionValidationV20PayloadSchema,
	version: z.literal('validation-2.0'),
});

export type RawApexTransactionValidationV20 = z.infer<typeof RawApexTransactionValidationV20Schema>;
