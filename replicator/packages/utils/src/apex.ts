/* * */

export interface ApexDecodedV3_CardInfo {
	cardIssuer: number
	cardNetworkID: string
	cardNumber: number
	cardPhysicalType: number
	cardSerialNumber: string
	cardTypeID: string
}

export interface ApexDecodedV3_Mac {
	aseCounterValue: number
	binaryDataMask: number
	fullMacFlag: number
	interruptedStatus: number
	macVersion: number
	raw: string
	samModel: number
	samSerialNumber: 2932387837
	samTypeVersion: number
	samWorkingMode: number
	transactionCounter: number
}

export interface ApexDecodedV3_ControlInfo {
	calendarID: string
	contractNumber: number
	// contractStatusData: []
	controlStatus: number
	controlType: number
	environmentStatus: number
	productLongID: string
	// profilesUsedData: []
	spatialValidityLongID: string
	tickLoadDate: string
	tickLoadMachCode: number
	tickLoadNumbDaily: number
	validityPeriodID: string
}

export interface ApexDecodedV3_ControlServiceInfo {
	blockID: string
	controlDestinationStopLongID: string
	controlerID: string
	controlOriginStopLongID: string
	dutyID: string
	journeyID: string
	lineLongID: string
	patternLongID: string
	vehicleID: number
	zoneLongID: string
}

export interface ApexDecodedV3_ValidationServiceInfo {
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

export interface ApexDecodedV3_CountersInfo {
	countersTransactionContext: number
	paperSaleAckCounter: number
	paperSaleCounter: number
	validationCounter: number
}

export interface ApexDecodedV3_ControlAckInfo {
	corrControlTransactionID: string
	finalControlStatus: number
}

export interface ApexDecodedV3_OperatorInfo {
	channelID: string
	deviceID: string
	networkID: string
	operatorLongID: string
}

export interface ApexDecodedV3_PaymentInfo {
	currency: number
	paymentMethod: number
	price: number
}

export interface ApexDecodedV3_SaleLoadInfo {
	contractNumber: number
	productLongID: string
	productQuantity: number
	// profilesUsedData: []
	salesPackageID: string
	// spatialValidityDetail: []
	tickLoadDate: string
	tickLoadMachCode: number
	tickLoadNumbDaily: number
	unitsQuantity: number
}

export interface ApexDecodedV3_ServiceInfo {
	blockID: string
	dutyID: string
	journeyID: string
	lineLongID: string
	onBehalfOfOperatorLongID: string
	outOfBoundsType: 0
	patternLongID: string
	stopLongID: string
	validatorID: number
	vehicleID: number
	zoneLongID: string
}

export interface ApexDecodedV3_SignedData {
	contractBinaryRead: string
	eventBinaryRead: string
	eventBinaryWritten: string
	raw: string
}

export interface ApexDecodedV3_TransactionInfo {
	apexTransactionType: number
	apexTransactionVersion: string
	transactionDate: string
	transactionGroupId: string
	transactionId: string
}

export interface ApexDecodedV3_ValidationInfo {
	calendarID: string
	contractNumber: number
	eventType: number
	// greylistItemsData: []
	productLongID: string
	// profilesUsedData: []
	spatialValidityLongID: string
	tickLoadDate: string
	tickLoadMachCode: number
	tickLoadNumbDaily: number
	unitsRemaining: number
	validationStatus: number
	validationType: number
	validityPeriodID: string
}

export interface ApexDecodedV3_VersionInfo {
	actionListsVersion: string
	apexVersion: string
	commercialOfferVersion: string
	networkVersion: string
	technicalParametersVersion: string
	vivaVersion: string
}

/* * */

export interface ApexDecodedTransactionV3VALIDATION {
	cardInfo: ApexDecodedV3_CardInfo
	mac: ApexDecodedV3_Mac
	operatorInfo: ApexDecodedV3_OperatorInfo
	serviceInfo: ApexDecodedV3_ServiceInfo
	signedData: ApexDecodedV3_SignedData
	transactionInfo: ApexDecodedV3_TransactionInfo
	validationInfo: ApexDecodedV3_ValidationInfo
	versionInfo: ApexDecodedV3_VersionInfo
}

export interface ApexDecodedTransactionV3SALE {
	mac: ApexDecodedV3_Mac
	operatorInfo: ApexDecodedV3_OperatorInfo
	paymentInfo: ApexDecodedV3_PaymentInfo
	signedData: ApexDecodedV3_SignedData
	transactionInfo: ApexDecodedV3_TransactionInfo
	validationInfo: ApexDecodedV3_ValidationInfo
	versionInfo: ApexDecodedV3_VersionInfo
}
