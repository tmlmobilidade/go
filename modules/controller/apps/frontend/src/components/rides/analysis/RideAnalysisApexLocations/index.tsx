'use client';

/* * */

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexLocations() {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.apex_locations' });

	const columns: DataTableColumn<SimplifiedApexLocation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('table_columns.created_at'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('table_columns.stop_id'),
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: t('table_columns.vehicle_id'),
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: t('table_columns.mac_sam_serial_number'),
			width: 160,
		},
		{
			accessor: '_id',
			title: t('table_columns.id_apex_location'),
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
		<Collapsible description={t('description')} title={t('title')}>
			{sortedSimplifiedApexLocations.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexLocations}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text={t('no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
