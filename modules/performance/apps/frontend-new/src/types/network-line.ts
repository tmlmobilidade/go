export interface NetworkLine {
	_id: string
	advances: null | number
	coverage: null | number
	delayDelta: null | number
	delays: null | number
	id: string
	name: string
	needsAttention: boolean
	operator: string
	service: null | number
	serviceDelta: null | number
	validations: null | number
	validationsDelta: null | number
}
