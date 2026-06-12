/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionValidationV50PayloadSchema = z.object({
	cardInfo: z.object({
		cardIssuer: z.number().nullable().default(null),
		cardNetworkID: z.string(),
		cardNumber: z.number().nullable().default(null),
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
		outOfBoundsType: z.number(),
		patternLongID: z.string(),
		stopLongID: z.string(),
		validatorID: z.number(),
		vehicleID: z.number(),
		zoneLongID: z.string().optional(),
	}),
	signedData: z.object({
		contractBinaryRead: z.string().nullable().default(null),
		eventBinaryRead: z.string().nullable().default(null),
		eventBinaryWritten: z.string().nullable().default(null),
		raw: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.number(),
		apexTransactionVersion: z.literal('5.0'),
		transactionDate: z.string(),
		transactionGroupId: z.string(),
		transactionId: z.string(),
	}),
	validationInfo: z.object({
		calendarID: z.string().nullable().default(null),
		contractNumber: z.number().nullable().default(null),
		eventType: z.number(),
		greylistItemsData: z.array(z.any()).default([]),
		productLongID: z.string().nullable().default(null),
		profilesUsedData: z.array(z.any()).default([]),
		spatialValidityLongID: z.string().nullable().default(null),
		tickLoadDate: z.string().nullable().default(null),
		tickLoadMachCode: z.number().nullable().default(null),
		tickLoadNumbDaily: z.number().nullable().default(null),
		unitsRemaining: z.number().nullable().default(null),
		validationStatus: z.number(),
		validationType: z.number(),
		validityPeriodID: z.string().nullable().default(null),
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

export type RawApexTransactionValidationV50Payload = z.infer<typeof RawApexTransactionValidationV50PayloadSchema>;

/* * */

export const RawApexTransactionValidationV50Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionValidationV50PayloadSchema,
	version: z.literal('apex-validation-5.0'),
});

export type RawApexTransactionValidationV50 = z.infer<typeof RawApexTransactionValidationV50Schema>;
