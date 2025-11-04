/* * */

/**
 * APEX Locations
 */
export type PCGI_ApexTransaction_Location = PCGI_ApexTransaction_Location_V3;

/* * */

/**
 * APEX Locations
 */
export interface PCGI_ApexTransaction_Location_V3 {

	countersInfo: {
		countersTransactionContext: number
		paperSaleAckCounter: number
		paperSaleCounter: number
		validationCounter: number
	}

	mac: {
		aseCounterValue: number
		binaryDataMask: number
		fullMacFlag: number
		interruptedStatus: number
		macVersion: number
		raw: string
		samModel: number
		samSerialNumber: number
		samTypeVersion: number
		samWorkingMode: number
		transactionCounter: number
	}

	operatorInfo: {
		channelID: string
		deviceID: string
		networkID: string
		operatorLongID: string
	}

	transactionInfo: {
		apexTransactionType: 19
		apexTransactionVersion: string
		transactionDate: string
		transactionGroupId: string
		transactionId: string
	}

	validationServiceInfo: {
		blockID: string
		dutyID: string
		journeyID: string
		lineLongID: string
		onBehalfOfOperatorLongID: string
		operationPlanID: string
		outOfBoundsType: number
		patternLongID: string
		stopLongID: string
		validatorID: number
		vehicleID: number
	}

	versionInfo: {
		actionListsVersion: string
		apexVersion: string
		commercialOfferVersion: string
		networkVersion: string
		technicalParametersVersion: string
		vivaVersion: string
	}

}
