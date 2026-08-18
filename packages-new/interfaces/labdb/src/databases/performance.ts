/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { metricRefreshTableSchema, passengerDemandByAgencyByMinuteTableSchema, passengerDemandByDimensionsBy5MinutesTableSchema, passengerDemandByDimensionsByDayTableSchema, passengerDemandRealtimeTableSchema } from '@/schemas/performance.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type MetricRefresh, type PassengerDemandByAgencyByMinute, type PassengerDemandByDimensionsBy5Minutes, type PassengerDemandByDimensionsByDay, type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';

/* * */

export class PerformanceDatabase {
	//

	public readonly metricRefreshes: ClickHouseInterfaceTemplate<MetricRefresh>;
	public readonly passengerDemandByAgencyByMinute: ClickHouseInterfaceTemplate<PassengerDemandByAgencyByMinute>;
	public readonly passengerDemandByDimensionsBy5Minutes: ClickHouseInterfaceTemplate<PassengerDemandByDimensionsBy5Minutes>;
	public readonly passengerDemandByDimensionsByDay: ClickHouseInterfaceTemplate<PassengerDemandByDimensionsByDay>;
	public readonly passengerDemandRealtime: ClickHouseInterfaceTemplate<PassengerDemandRealtime>;

	private readonly databaseName = 'performance';

	public constructor(instance: ClickHouseClient) {
		this.metricRefreshes = new ClickHouseInterfaceTemplate<MetricRefresh>(instance, this.databaseName, 'metric_refreshes', metricRefreshTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['metric_name', 'range_start', 'refresh_id'],
			partitionBy: 'intDiv(range_start, 100)',
		});
		this.passengerDemandByAgencyByMinute = new ClickHouseInterfaceTemplate<PassengerDemandByAgencyByMinute>(instance, this.databaseName, 'passenger_demand_by_agency_by_1_minute', passengerDemandByAgencyByMinuteTableSchema, {
			engine: 'ReplacingMergeTree(calculated_at)',
			orderBy: ['definition_version', 'operational_date', 'agency_id', 'interval_start'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
		this.passengerDemandByDimensionsBy5Minutes = new ClickHouseInterfaceTemplate<PassengerDemandByDimensionsBy5Minutes>(instance, this.databaseName, 'passenger_demand_by_dimensions_by_5_minutes', passengerDemandByDimensionsBy5MinutesTableSchema, {
			engine: 'MergeTree()',
			orderBy: ['definition_version', 'operational_date', 'agency_id', 'line_id', 'pattern_id', 'stop_id', 'interval_start'],
			partitionBy: 'operational_date',
		});
		this.passengerDemandByDimensionsByDay = new ClickHouseInterfaceTemplate<PassengerDemandByDimensionsByDay>(instance, this.databaseName, 'passenger_demand_by_dimensions_by_day', passengerDemandByDimensionsByDayTableSchema, {
			engine: 'MergeTree()',
			orderBy: ['definition_version', 'operational_date', 'agency_id', 'line_id', 'pattern_id', 'product_id', 'category'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
		this.passengerDemandRealtime = new ClickHouseInterfaceTemplate<PassengerDemandRealtime>(instance, this.databaseName, 'passenger_demand_realtime', passengerDemandRealtimeTableSchema, {
			engine: 'ReplacingMergeTree(calculated_at)',
			orderBy: ['definition_version', 'current_operational_date', 'agency_id'],
			partitionBy: 'intDiv(current_operational_date, 100)',
		});
	}

	public async init() {
		await Promise.all([
			this.metricRefreshes.init(),
			this.passengerDemandByAgencyByMinute.init(),
			this.passengerDemandByDimensionsBy5Minutes.init(),
			this.passengerDemandByDimensionsByDay.init(),
			this.passengerDemandRealtime.init(),
		]);
	}
}
