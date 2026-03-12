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
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'trigger_activity',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.activity.label'),
			width: 150,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.stop_id.label'),
			width: 150,
		},
		{
			accessor: 'vehicle_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.vehicle_id.label'),
			width: 150,
		},
		{
			accessor: 'driver_id',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.driver_id.label'),
			width: 150,
		},
		{
			accessor: 'odometer',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.odometer.label'),
			width: 150,
		},
		{
			accessor: 'trigger_door',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.door.label'),
			width: 150,
		},
		{
			accessor: 'latitude',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.latitude.label'),
			width: 220,
		},
		{
			accessor: 'longitude',
			title: t('default:rides.analysis.RideAnalysisVehicleEvents.Table.columns.longitude.label'),
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
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisVehicleEvents.description')}
			title={t('default:rides.analysis.RideAnalysisVehicleEvents.title')}
		>
			<DataTable columns={columns} maxHeight={600} records={sortedVehicleEvents} rowIdAccessor="_id" />
		</Collapsible>
	);

	//
}
