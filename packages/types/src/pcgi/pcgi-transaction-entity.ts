/* * */

export interface PCGI_TransactionEntity {
	_id: string
	cardSerialNumber: string
	createdAt: string
	csvValue: string
	decodeValue: string
	duplicated: boolean
	fileId: string
	isBeingACK: boolean
	isDecoded: true
	isOK: boolean
	isReprocessed: boolean
	operatorLongId: string
	respondedAt: string
	status: boolean
	transaction: string
	transactionId: string
	transactionstring: string
	transactionType: number
	updatedAt: string
	validatedAt: string
	verified: boolean
}
