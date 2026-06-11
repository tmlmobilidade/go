/* * */

import { RawApexTransactionBaseSchema } from '@/raw/raw-apex-transaction-base.js';
import { z } from 'zod';

/* * */

export const RawApexTransactionSaleV30PayloadSchema = z.object({
	cardInfo: z.object({
		cardNetworkID: z.string(),
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
	paymentInfo: z.object({
		currency: z.number(),
		paymentMethod: z.number(),
		price: z.number(),
	}),
	saleLoadInfo: z.object({
		contractNumber: z.number(),
		productLongID: z.string(),
		productQuantity: z.number(),
		profilesUsedCount: z.number(),
		profilesUsedData: z.array(z.any()),
		salesPackageID: z.string(),
		spatialValidityCount: z.number(),
		spatialValidityDetail: z.array(z.any()),
		tickLoadDate: z.string(),
		tickLoadMachCode: z.number(),
		tickLoadNumbDaily: z.number(),
		unitsQuantity: z.number(),
	}),
	signedData: z.object({
		raw: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.literal(3),
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

export type RawApexTransactionSaleV30Payload = z.infer<typeof RawApexTransactionSaleV30PayloadSchema>;

/* * */

export const RawApexTransactionSaleV30Schema = RawApexTransactionBaseSchema.extend({
	payload: RawApexTransactionSaleV30PayloadSchema,
	version: z.literal('apex-sale-3.0'),
});

export type RawApexTransactionSaleV30 = z.infer<typeof RawApexTransactionSaleV30Schema>;
