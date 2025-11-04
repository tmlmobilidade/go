/* * */

/**
 * APEX Sales or Refunds
 */
export type PCGI_ApexTransaction_Sale = PCGI_ApexTransaction_Sale_V2;

/* * */

/**
 * APEX Sales or Refunds
 */
export interface PCGI_ApexTransaction_Sale_V2 {

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

	paymentInfo: {
		currency: number
		invoiceNumber: string
		paymentMethod: number
		price: number
		usageDays: number
		usageValue: number
		vatNumber: number
	}

	saleLoadInfo: {
		contractNumber: number
		greenlistItemID: string
		greylistItemID: string
		productLongID: string
		productQuantity: number
		profilesUsedCount: number
		profilesUsedData: {
			profileLongID: string
		}[]
		salesPackageID: string
		SpatialValidityCount: number
		spatialValidityDetail: {
			productMatrixElementID: string
			spatialValidityLongID: string
			zonesCount: number
		}[]
		tickLoadDate: string
		tickLoadMachCode: number
		tickLoadNumbDaily: number
		unitsQuantity: number
		voucherNr: string
	}

	signedData: {
		contractBinaryRead: string
		eventBinaryRead: string
		eventBinaryWritten: string
		raw: string
	}

	transactionInfo: {
		apexTransactionType: 3
		apexTransactionVersion: '2.0'
		transactionDate: string
		transactionGroupId: string
		transactionId: string
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
