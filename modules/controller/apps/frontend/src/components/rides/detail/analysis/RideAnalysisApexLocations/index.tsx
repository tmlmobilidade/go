'use client';

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRidesDetailApexLocationsData } from '@/components/rides/detail/shared/use-rides-detail-apex-locations-data';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { Collapsible, DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexLocations() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: simplifiedApexLocationsData } = useRidesDetailApexLocationsData();

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
		if (!simplifiedApexLocationsData?.length) return [];
		return simplifiedApexLocationsData.sort((a, b) => a.created_at - b.created_at);
	}, [simplifiedApexLocationsData]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisApexLocations.description')} title={t('default:rides.analysis.RideAnalysisApexLocations.title')}>
			<DataTable
				columns={columns}
				records={sortedSimplifiedApexLocations}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);
}
