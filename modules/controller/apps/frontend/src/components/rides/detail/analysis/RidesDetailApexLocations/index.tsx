'use client';

/* * */

import { TimestampTag } from '@/components/common/TimestampTag';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { useMemo } from 'react';

/* * */

export function RidesDetailApexLocations() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	const columns: DataTableColumn<SimplifiedApexLocation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: 'Timestamp',
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: 'Stop ID',
			width: 100,
		},
		{
			accessor: 'vehicle_id',
			title: 'Vehicle ID',
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: 'SAM SN',
			width: 160,
		},
		{
			accessor: '_id',
			title: 'ID Apex Location',
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexLocations = useMemo(() => {
		return sortByUnixTimestamp(ridesDetailContext.data.simplified_apex_locations, 'created_at', 'asc');
	}, [ridesDetailContext.data.simplified_apex_locations]);

	//
	// C. Render components

	return (
		<Collapsible description="Localizações APEX associadas a esta Ride." title="APEX Locations">
			{sortedSimplifiedApexLocations.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexLocations}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text="Nenhuma Localização APEX Registada" />
				</Section>
			)}
		</Collapsible>
	);

	//
}
