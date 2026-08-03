/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { rideAnalysisAtLeastOneVehicleEventOnFirstStopTableSchema, ridesTableSchema, simplifiedVehicleEventTableSchema } from '@/schemas/operation.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type RideAnalysisAtLeastOneVehicleEventOnFirstStop, type RideAnalysisEndedAtLastStop, type RideAnalysisExpectedApexValidationInterval, type RideAnalysisExpectedDriverIdQty, type RideAnalysisExpectedStartTime, type RideAnalysisExpectedVehicleEventDelay, type RideAnalysisExpectedVehicleEventInterval, type RideAnalysisExpectedVehicleEventQty, type RideAnalysisExpectedVehicleIdQty, type RideAnalysisMatchingApexLocations, type RideAnalysisMatchingVehicleIds, type RideAnalysisSimpleOneApexValidation, type RideAnalysisSimpleOneVehicleEventOrApexValidation, type RideAnalysisSimpleThreeVehicleEvents, type RideAnalysisTransactionSequentiality } from '@tmlmobilidade/go-types-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class OperationDatabase {
	//

	public readonly rideAnalysisAtLeastOneVehicleEventOnFirstStop: ClickHouseInterfaceTemplate<RideAnalysisAtLeastOneVehicleEventOnFirstStop>;
	public readonly rideAnalysisEndedAtLastStop: ClickHouseInterfaceTemplate<RideAnalysisEndedAtLastStop>;
	public readonly rideAnalysisExpectedApexValidationInterval: ClickHouseInterfaceTemplate<RideAnalysisExpectedApexValidationInterval>;
	public readonly rideAnalysisExpectedDriverIdQty: ClickHouseInterfaceTemplate<RideAnalysisExpectedDriverIdQty>;
	public readonly rideAnalysisExpectedStartTime: ClickHouseInterfaceTemplate<RideAnalysisExpectedStartTime>;
	public readonly rideAnalysisExpectedVehicleEventDelay: ClickHouseInterfaceTemplate<RideAnalysisExpectedVehicleEventDelay>;
	public readonly rideAnalysisExpectedVehicleEventInterval: ClickHouseInterfaceTemplate<RideAnalysisExpectedVehicleEventInterval>;
	public readonly rideAnalysisExpectedVehicleEventQty: ClickHouseInterfaceTemplate<RideAnalysisExpectedVehicleEventQty>;
	public readonly rideAnalysisExpectedVehicleIdQty: ClickHouseInterfaceTemplate<RideAnalysisExpectedVehicleIdQty>;
	public readonly rideAnalysisMatchingApexLocations: ClickHouseInterfaceTemplate<RideAnalysisMatchingApexLocations>;
	public readonly rideAnalysisMatchingVehicleIds: ClickHouseInterfaceTemplate<RideAnalysisMatchingVehicleIds>;
	public readonly rideAnalysisSimpleOneApexValidation: ClickHouseInterfaceTemplate<RideAnalysisSimpleOneApexValidation>;
	public readonly rideAnalysisSimpleOneVehicleEventOrApexValidation: ClickHouseInterfaceTemplate<RideAnalysisSimpleOneVehicleEventOrApexValidation>;
	public readonly rideAnalysisSimpleThreeVehicleEvents: ClickHouseInterfaceTemplate<RideAnalysisSimpleThreeVehicleEvents>;
	public readonly rideAnalysisTransactionSequentiality: ClickHouseInterfaceTemplate<RideAnalysisTransactionSequentiality>;
	public readonly rides: ClickHouseInterfaceTemplate<Ride>;
	public readonly simplifiedVehicleEvents: ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>;

	private readonly databaseName = 'operation';

	public constructor(instance: ClickHouseClient) {
		this.rideAnalysisAtLeastOneVehicleEventOnFirstStop = new ClickHouseInterfaceTemplate<RideAnalysisAtLeastOneVehicleEventOnFirstStop>(instance, this.databaseName, 'ride_analysis_at_least_one_vehicle_event_on_first_stop', rideAnalysisAtLeastOneVehicleEventOnFirstStopTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['ride_id', 'updated_at'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
		this.rides = new ClickHouseInterfaceTemplate<Ride>(instance, this.databaseName, 'rides', ridesTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['agency_id', 'operational_date', 'route_short_name', 'shape_id', 'start_time_scheduled', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
		this.simplifiedVehicleEvents = new ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>(instance, this.databaseName, 'simplified_vehicle_events', simplifiedVehicleEventTableSchema, {
			engine: 'ReplacingMergeTree(created_at)',
			orderBy: ['agency_id', 'operational_date', 'vehicle_id', 'created_at', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
	}

	public async init() {
		await this.rideAnalysisAtLeastOneVehicleEventOnFirstStop.init();
		await this.rideAnalysisEndedAtLastStop.init();
		await this.rideAnalysisExpectedApexValidationInterval.init();
		await this.rideAnalysisExpectedDriverIdQty.init();
		await this.rideAnalysisExpectedStartTime.init();
		await this.rideAnalysisExpectedVehicleEventDelay.init();
		await this.rideAnalysisExpectedVehicleEventInterval.init();
		await this.rideAnalysisExpectedVehicleEventQty.init();
		await this.rideAnalysisExpectedVehicleIdQty.init();
		await this.rideAnalysisMatchingApexLocations.init();
		await this.rideAnalysisMatchingVehicleIds.init();
		await this.rideAnalysisSimpleOneApexValidation.init();
		await this.rideAnalysisSimpleOneVehicleEventOrApexValidation.init();
		await this.rideAnalysisSimpleThreeVehicleEvents.init();
		await this.rideAnalysisTransactionSequentiality.init();
		await this.rides.init();
		await this.simplifiedVehicleEvents.init();
	}
}
