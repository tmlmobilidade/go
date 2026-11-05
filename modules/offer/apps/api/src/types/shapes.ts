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
	summary: {
		length: number // kilometers
		time: number // seconds
	}
}

/* * */

// Optional (future-proofing a bit, but not required yet)
export interface ValhallaLocation {
	lat: number
	lon: number
	type?: 'break' | 'break_through' | 'through' | 'via'
}

/* * */

export interface ValhallaRouteRequest {
	costing: 'auto' | 'bicycle' | 'bus' | 'pedestrian'
	costing_options?: {
		bus?: {
			use_ferry?: number
		}
	}
	directions_options?: {
		narrative?: boolean
		units: 'kilometers' | 'miles'
	}
	locations: ValhallaLocation[]
}
