/* * */

export interface OfferJourney {
	agencyId: string // '21'
	arrivalTime: string // '14:43:00'
	bikesAllowed: number // 0
	blockId: string // ''
	circular: number // 1
	continuousDropOff: number // 0
	continuousPickup: number // 0
	date: string // '2024-09-30'
	dayType: number // 1
	dayTypeName: string // 'Workday'
	departureTime: string // '14:10:00'
	directionId: number // 0
	endShiftId: string // ''
	endStopCode: string // ''
	endStopId: string // '20958'
	endStopName: string // 'Carcavelos - Estação - Cais 1'
	feedId: string // 'GTFS_FEED'
	holiday: number // 0
	holidayName: string // 'Non_holiday'
	lineId: string // '36'
	lineLongName: string // 'Trajouce Norte - Carcavelos Estação via Outeiro da Polima'
	lineShortName: string // '36'
	pathType: number // 1
	patternId: string // 'M36_A_0'
	patternShortName: string // 'M36_A_0'
	period: number // 3
	periodName: string // 'Summer'
	routeColor: string // '4e0963'
	routeDesc: string // ''
	routeDestination: string // 'Carcavelos - Estação - Cais 1'
	routeId: string // 'M36_A'
	routeLongName: string // 'Trajouce - Carcavelos'
	routeOrigin: string // 'Apadil'
	routeShortName: string // '36'
	routeTextColor: string // 'ffffff'
	routeType: string // '3'
	rowId: number // 1692102
	school: string // '0'
	shapeId: string // 'r57n'
	startShiftId: string // ''
	startStopCode: string // ''
	startStopId: string // '20558'
	startStopName: string // 'Apadil'
	tripHeadsign: string // 'Carcavelos Estação'
	tripId: string // 'M36-1-014-A-U-14h10-Apadil'
	tripLength: number // '10698.14'
	wheelchairAccessible: number // 0
}

/* * */

export interface OfferStop {
	arrivalTime: string // '14:17:52'
	bench: number // 0
	continuousDropOff: number // 0
	continuousPickup: number // 0
	date: string // '2024-09-01'
	departureTime: string // '14:17:52'
	dropOffType: number // 0
	entranceRestriction: number // 0
	equipment: number // 0
	exitRestriction: number // 0
	feedId: string // 'testeCascais'
	locationType: number // 0
	municipality: number // 1105
	municipalityFare1: null
	municipalityFare2: null
	networkMap: number // 0
	parentStation: string // ''
	pickupType: number // 0
	platformCode: string // ''
	preservationState: number // 0
	realTimeInformation: number // 0
	region: string
	rowId: number // 1
	schedule: number // 0
	shapeDistTraveled: number // 4217.77
	shelter: number // 0
	signalling: number // 0
	slot: number // 0
	stopCode: string // ''
	stopDesc: string // ''
	stopHeadsign: string // 'Rua da Torre'
	stopId: string // '20811'
	stopIdStepp: string // 'Stepp_20811'
	stopLat: number // 38.69632
	stopLon: number // -9.441346
	stopName: string // 'Rua da Torre'
	stopRemarks: string // ''
	stopSequence: number // 11
	tariff: number // 0
	timepoint: number // 0
	tripId: string // 'M27-1-079-A-SDF-14h05-CascaisEstacao'
	wheelchairBoarding: number // 0
	zoneShift: number // 0
}
