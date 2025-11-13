/* * */

/**
 * APEX Validations
 */
export type PCGI_ApexTransaction_Validation = PCGI_ApexTransaction_Validation_V3;

/* * */

/**
 * APEX Validations
 */
export interface PCGI_ApexTransaction_Validation_V3 {

	cardInfo: {
		cardIssuer: number
		cardNetworkID: string
		cardNumber: number
		cardPhysicalType: number
		cardSerialNumber: string
		cardTypeID: string
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

	serviceInfo: {
		blockID: string
		dutyID: string
		journeyID: string
		lineLongID: string
		onBehalfOfOperatorLongID: string
		outOfBoundsType: number
		patternLongID: string
		stopLongID: string
		validatorID: number
		vehicleID: number
		zoneLongID: string
	}

	signedData: {
		contractBinaryRead: string
		eventBinaryRead: string
		eventBinaryWritten: string
		raw: string
	}

	transactionInfo: {
		apexTransactionType: 11
		apexTransactionVersion: '3.0'
		transactionDate: string
		transactionGroupId: string
		transactionId: string
	}

	validationInfo: {
		calendarID: string
		contractNumber: number
		eventType: number
		greylistItemsData: []
		productLongID: string
		profilesUsedData: {
			profileLongID: string
		}[]
		spatialValidityLongID: string
		tickLoadDate: string
		tickLoadMachCode: number
		tickLoadNumbDaily: number
		unitsRemaining: number
		validationStatus: number
		validationType: number
		validityPeriodID: string
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
