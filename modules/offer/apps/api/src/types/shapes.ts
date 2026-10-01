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

/* * */

export interface RoutePreviewPoint {
	lat: number
	lon: number
	type?: 'break' | 'through' | 'via'
}

export interface RoutePreviewDto {
	costing?: 'auto' | 'bicycle' | 'bus' | 'pedestrian'
	costing_options?: {
		bus?: {
			use_ferry?: number
		}
	}
	points: RoutePreviewPoint[]
}

export interface RoutePreviewLeg {
	distance: number
	duration: number
	encoded_polyline: string
	from_index: number
	geojson: {
		geometry: {
			coordinates: [number, number][]
			type: 'LineString'
		}
		properties: {
			distance: number
			duration: number
			from_index: number
			to_index: number
		}
		type: 'Feature'
	}
	geometry: [number, number][]
	to_index: number
}

export interface RoutePreviewResponse {
	distance: number
	duration: number
	encoded_polyline: string
	geojson: {
		geometry: {
			coordinates: [number, number][]
			type: 'LineString'
		}
		properties: {
			distance: number
			duration: number
		}
		type: 'Feature'
	}
	geometry: [number, number][]
	legs: RoutePreviewLeg[]
}
