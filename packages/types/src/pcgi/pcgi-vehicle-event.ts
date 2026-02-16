/* * */

/**
 * PCGI Vehicle Event
 */
export interface PcgiVehicleEvent {
	_id: string
	content: {
		entity: {
			_id: string
			vehicle: {
				agencyId: string
				currentStatus: string
				occupancyStatus: string
				operationPlanId: string
				position: {
					bearing: number
					latitude: number
					longitude: number
					odometer: number
					speed: number
				}
				stopId: string
				timestamp: number
				trigger: {
					activity: string
					door: string
				}
				trip: {
					lineId: string
					patternId: string
					routeId: string
					scheduleRelationship: string
					tripId: string
				}
				vehicle: {
					_id: string
					blockId: string
					driverId: string
					shiftId: string
				}
			}
		}[]
		header: {
			gtfsRealtimeVersion: string
			incrementality: string
			timestamp: number
		}
	}
	millis: number
}
