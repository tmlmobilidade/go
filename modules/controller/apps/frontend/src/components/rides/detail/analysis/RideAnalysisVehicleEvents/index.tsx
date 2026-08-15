'use client';

import { useRidesDetailVehicleEventsData } from '@/components/rides/detail/shared/use-rides-detail-vehicle-events-data';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Collapsible, DataTable, DataTableColumn, UnixTimestampDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisVehicleEvents() {
	//

	//
	// A. Setup variables

	const { data: vehicleEventsData } = useRidesDetailVehicleEventsData();

	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedVehicleEvent>[] = [
		{
			accessor: '_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns._id.label'),
			width: 250,
		},
		{
			accessor: 'created_at',
			render: item => <UnixTimestampDisplay value={item.created_at} showDate />,
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.stop_id.label'),
			width: 150,
		},
		{
			accessor: 'vehicle_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.vehicle_id.label'),
			width: 150,
		},
		{
			accessor: 'driver_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.driver_id.label'),
			width: 150,
		},
		{
			accessor: 'odometer',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.odometer.label'),
			width: 150,
		},
		{
			accessor: 'latitude',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.latitude.label'),
			width: 220,
		},
		{
			accessor: 'longitude',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.table.columns.longitude.label'),
			width: 220,
		},
	];

	//
	// B. Transform data

	const sortedVehicleEvents = useMemo(() => {
		if (!vehicleEventsData?.length) return [];
		return vehicleEventsData.sort((a, b) => a.created_at - b.created_at);
	}, [vehicleEventsData]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisVehicleEvents.description')}
			title={t('default:rides.analysis.RideAnalysisVehicleEvents.title')}
		>
			<DataTable
				columns={columns}
				records={sortedVehicleEvents}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);
}
