'use client';

/* * */

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RideAnalysisVehicleEvents() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();

	const columns: DataTableColumn<SimplifiedVehicleEvent>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: 'Timestamp',
			width: 280,
		},
		{
			accessor: 'trigger_activity',
			title: 'Activity',
			width: 150,
		},
		{
			accessor: 'stop_id',
			title: 'Stop ID',
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: 'Vehicle ID',
			width: 100,
		},
		{
			accessor: 'driver_id',
			title: 'Driver ID',
			width: 100,
		},
		{
			accessor: 'odometer',
			title: 'Odometer',
			width: 150,
		},
		{
			accessor: 'trigger_door',
			title: 'Door',
			width: 150,
		},
		{
			accessor: 'latitude',
			title: 'Latitude',
			width: 220,
		},
		{
			accessor: 'longitude',
			title: 'Longitude',
			width: 220,
		},
	];

	//
	// B. Transform data

	const sortedVehicleEvents = useMemo(() => {
		return RideAnalysisContext.data.vehicle_events.sort((a, b) => a.created_at - b.created_at);
	}, [RideAnalysisContext.data.vehicle_events]);

	//
	// C. Render components

	return (
		<Collapsible description="Eventos GTFS-RT gerados pelo veículo." title="Vehicle Events">
			<DataTable
				columns={columns}
				records={sortedVehicleEvents}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);

	//
}
