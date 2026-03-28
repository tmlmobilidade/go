/* * */

import { RawApexTransactionBaseSchema } from '@/apex/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionInspectionV20PayloadSchema = z.object({
	cardInfo: z.object({
		cardIssuer: z.number(),
		cardNetworkID: z.string(),
		cardNumber: z.number(),
		cardPhysicalType: z.number(),
		cardSerialNumber: z.string(),
		cardTypeID: z.string(),
	}),
	controlInfo: z.object({
		calendarID: z.string(),
		contractNumber: z.number(),
		contractStatusData: z.array(z.object({
			contractNumber: z.number(),
			contractStatus: z.number(),
		})),
		controlStatus: z.number(),
		controlType: z.number(),
		environmentStatus: z.number(),
		productLongID: z.string(),
		profilesUsedCount: z.number(),
		profilesUsedData: z.array(z.any()),
		spatialValidityLongID: z.string(),
		tickLoadDate: z.string(),
		tickLoadMachCode: z.number(),
		tickLoadNumbDaily: z.number(),
		validityPeriodID: z.string(),
	}),
	controlServiceInfo: z.object({
		blockID: z.string(),
		controlDestinationStopLongID: z.string(),
		controlerID: z.string(),
		controlOriginStopLongID: z.string(),
		dutyID: z.string(),
		journeyID: z.string(),
		lineLongID: z.string(),
		patternLongID: z.string(),
		vehicleID: z.number(),
		zoneLongID: z.string(),
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
		contractBinaryRead: z.string(),
		environmentBinaryRead: z.string(),
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
	version: z.literal('apex-inspection-2.0'),
});

export type RawApexTransactionInspectionV20 = z.infer<typeof RawApexTransactionInspectionV20Schema>;
