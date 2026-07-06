/* * */

export interface ValhallaRouteResponse {
	trip: {
		legs: ValhallaRouteLeg[]
		summary: {
			length: number // kilometers
			time: number // seconds
		}
	}
}

/* * */

export interface ValhallaRouteLeg {
	shape: string // encoded polyline
}

/* * */

// Optional (future-proofing a bit, but not required yet)
export interface ValhallaLocation {
	lat: number
	lon: number
	type?: 'break' | 'through' | 'via'
}

/* * */

export interface ValhallaRouteRequest {
	costing: 'auto' | 'bicycle' | 'bus' | 'pedestrian'
	directions_options?: {
		units: 'kilometers' | 'miles'
	}
	locations: ValhallaLocation[]
}
