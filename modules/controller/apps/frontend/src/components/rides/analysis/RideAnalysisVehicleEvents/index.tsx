'use client';

/* * */

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisVehicleEvents() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedVehicleEvent>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'trigger_activity',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.activity.label'),
			width: 150,
		},
		{
			accessor: 'stop_id',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.vehicle_id.label'),
			width: 100,
		},
		{
			accessor: 'driver_id',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.driver_id.label'),
			width: 100,
		},
		{
			accessor: 'odometer',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.odometer.label'),
			width: 150,
		},
		{
			accessor: 'trigger_door',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.door.label'),
			width: 150,
		},
		{
			accessor: 'latitude',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.latitude.label'),
			width: 220,
		},
		{
			accessor: 'longitude',
			title: t('controller:rides.analysis.VehicleEvents.Table.columns.longitude.label'),
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
		<Collapsible description={t('controller:rides.analysis.VehicleEvents.description')} title={t('controller:rides.analysis.VehicleEvents.title')}>
			<DataTable
				columns={columns}
				records={sortedVehicleEvents}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);

	//
}
