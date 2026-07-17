/* * */

export type MotisQuery = Record<string, unknown>;

export interface MotisPlanLeg {
	[key: string]: unknown
	hubPatternId?: null | string
	tripId?: string
}

export interface MotisItinerary {
	[key: string]: unknown
	legs: MotisPlanLeg[]
}

export interface MotisPlanResponse {
	[key: string]: unknown
	direct: MotisItinerary[]
	itineraries: MotisItinerary[]
}
