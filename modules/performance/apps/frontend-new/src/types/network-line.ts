export type LineConfidence = 'high' | 'medium';

export interface NetworkLine {
	_id: string
	advances: number
	alerts: number
	confidence: LineConfidence
	delayDelta: number
	delays: number
	id: string
	name: string
	needsAttention: boolean
	operator: string
	service: number
	serviceDelta: number
	validations: null | number
	validationsDelta: null | number
}
