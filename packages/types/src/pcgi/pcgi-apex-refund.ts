/* * */

/**
 * APEX Refund
 */
export type PCGI_ApexTransaction_Refund = PCGI_ApexTransaction_Refund_V2;

/* * */

/**
 * APEX Refund
 */
export interface PCGI_ApexTransaction_Refund_V2 {

	cardInfo: {
		cardNetworkID: string
		cardPhysicalType: number
		cardSerialNumber: string
	}

	loadCorrInfo: {
		corrTickLoadDate: string
		corrTickLoadMachCode: number
		corrTickLoadNumbDaily: number
		corrTransactionId: string
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
		paymentMethod: number
		price: number
	}

	saleLoadInfo: {
		contractNumber: number
		productLongID: string
		productQuantity: number
		salesPackageID: string
		tickLoadDate: string
		tickLoadMachCode: number
		tickLoadNumbDaily: number
		unitsQuantity: number
	}

	transactionInfo: {
		apexTransactionType: 6
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
