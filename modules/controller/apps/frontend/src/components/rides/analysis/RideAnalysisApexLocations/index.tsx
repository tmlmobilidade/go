'use client';

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexLocations() {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedApexLocation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.vehicle_id.label'),
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.mac_sam_serial_number.label'),
			width: 160,
		},
		{
			accessor: '_id',
			title: t('default:rides.analysis.RideAnalysisApexLocations.Table.columns.id_apex_location.label'),
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexLocations = useMemo(() => {
		return sortByUnixTimestamp(rideAnalysisContext.data.simplified_apex_locations, 'created_at', 'asc');
	}, [rideAnalysisContext.data.simplified_apex_locations]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisApexLocations.description')} title={t('default:rides.analysis.RideAnalysisApexLocations.title')}>
			{sortedSimplifiedApexLocations.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexLocations}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text={t('default:rides.analysis.RideAnalysisApexLocations.no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
