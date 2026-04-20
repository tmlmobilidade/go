/* * */

export interface Vehicle {
	bearing?: number
	id: string
	lat: number
	line_id?: string
	lon: number
	speed?: number
	timestamp: number
	trip_id?: string
}

export interface GridPosition {
	bearing: number
	id: string
	timestamp: number
	tripId?: string
	x: number
	y: number
}

export interface AnimatedPosition extends GridPosition {
	targetX: number
	targetY: number
}
