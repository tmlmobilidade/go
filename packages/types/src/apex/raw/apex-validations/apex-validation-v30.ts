/* * */

import { z } from 'zod';

/* * */

export const RawApexValidationV30Schema = z.object({
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
		journeyID: z.string(),
		lineLongID: z.string(),
		outOfBoundsType: z.number(),
		patternLongID: z.string(),
		stopLongID: z.string(),
		validatorID: z.number(),
		vehicleID: z.number(),
		zoneLongID: z.string(),
	}),
	signedData: z.object({
		contractBinaryRead: z.string(),
		eventBinaryRead: z.string(),
		eventBinaryWritten: z.string(),
		raw: z.string(),
	}),
	transactionInfo: z.object({
		apexTransactionType: z.number(),
		apexTransactionVersion: z.literal('3.0'),
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
		unitsRemaining: z.number(),
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

/**
 * APEX Validations are APEX transactions of type 11 that are generated when a card holder touches a validator
 * reader (ex: bus validator, subway gate). These validation transactions represent the card holder's right to travel
 * on a given route, line, or vehicle. T11s have statuses that indicate if the card holder was allowed to travel
 * or not, and with which conditions. A validation also contains information about the card holder's card, the vehicle,
 * the validator machine, the route, and the time and location of the validation.
 */
export type RawApexValidationV30 = z.infer<typeof RawApexValidationV30Schema>;
