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

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.vehicleEvents' });

	const columns: DataTableColumn<SimplifiedVehicleEvent>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('tableColumns.createdAt'),
			width: 280,
		},
		{
			accessor: 'trigger_activity',
			title: t('tableColumns.activity'),
			width: 150,
		},
		{
			accessor: 'stop_id',
			title: t('tableColumns.stopId'),
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: t('tableColumns.vehicleId'),
			width: 100,
		},
		{
			accessor: 'driver_id',
			title: t('tableColumns.driverId'),
			width: 100,
		},
		{
			accessor: 'odometer',
			title: t('tableColumns.odometer'),
			width: 150,
		},
		{
			accessor: 'trigger_door',
			title: t('tableColumns.door'),
			width: 150,
		},
		{
			accessor: 'latitude',
			title: t('tableColumns.latitude'),
			width: 220,
		},
		{
			accessor: 'longitude',
			title: t('tableColumns.longitude'),
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
		<Collapsible description={t('description')} title={t('title')}>
			<DataTable
				columns={columns}
				records={sortedVehicleEvents}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);

	//
}
