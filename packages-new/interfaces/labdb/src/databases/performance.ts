/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { demandByAgencyByOperationalDateTableSchema, metricRefreshTableSchema, passengerDemandByAgencyByMinuteTableSchema, passengerDemandRealtimeTableSchema } from '@/schemas/performance.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type DemandByAgencyByOperationalDate, type MetricRefresh, type PassengerDemandByAgencyByMinute,	type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';

/* * */

export class PerformanceDatabase {
	//

	public readonly demandByAgencyByOperationalDate: ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>;
	public readonly metricRefreshes: ClickHouseInterfaceTemplate<MetricRefresh>;
	public readonly passengerDemandByAgencyByMinute: ClickHouseInterfaceTemplate<PassengerDemandByAgencyByMinute>;
	public readonly passengerDemandRealtime: ClickHouseInterfaceTemplate<PassengerDemandRealtime>;

	private readonly databaseName = 'performance';

	public constructor(instance: ClickHouseClient) {
		this.demandByAgencyByOperationalDate = new ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>(instance, this.databaseName, 'demand_by_agency_by_operational_date', demandByAgencyByOperationalDateTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['operational_date', 'agency_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
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
		this.passengerDemandRealtime = new ClickHouseInterfaceTemplate<PassengerDemandRealtime>(instance, this.databaseName, 'passenger_demand_realtime', passengerDemandRealtimeTableSchema, {
			engine: 'ReplacingMergeTree(calculated_at)',
			orderBy: ['definition_version', 'current_operational_date', 'agency_id'],
			partitionBy: 'intDiv(current_operational_date, 100)',
		});
	}

	public async init() {
		await Promise.all([
			this.demandByAgencyByOperationalDate.init(),
			this.metricRefreshes.init(),
			this.passengerDemandByAgencyByMinute.init(),
			this.passengerDemandRealtime.init(),
		]);
	}
}
