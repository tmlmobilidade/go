'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/create/RealtimeCreate.context';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Checkbox, DataTable, DataTableColumn, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { OperationalStatusTag } from '../OperationalStatusTag';
import { RidesListCellHeadsign } from '../RidesListCellHeadsign';
import { SeenStatusTag } from '../SeenStatusTag';

/* * */

export function RealtimeCreateStepRidesSelection() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	const formatTimestamp = (timestamp: UnixTimestamp) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt') : null;
	};

	const columns: DataTableColumn<RideNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Checkbox checked={realtimeCreateContext.data.form.getValues().references?.some(reference => reference.parent_id === item._id) ?? false} />,
			title: '',
			width: 50,
		},
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusTag value={item.seen_status} />,
			title: '',
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusTag value={item.operational_status} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.pattern_id} />,
			title: 'Pattern',
			width: 500,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: 'Partida',
			width: 80,
		},
	];

	//
	// B. Transform data

	const visibleRides = useMemo(() => {
		if (realtimeCreateContext.filters.view_mode.value === 'selected') {
			const selectedRideIds = realtimeCreateContext.data.form.getValues().references?.map(reference => reference.parent_id) ?? [];
			return realtimeCreateContext.data.filtered_rides.filter(ride => selectedRideIds.some(selectedRideId => selectedRideId === ride._id) ?? false);
		}
		return realtimeCreateContext.data.filtered_rides;
	}, [realtimeCreateContext.data.filtered_rides, realtimeCreateContext.data.form, realtimeCreateContext.filters.view_mode.value]);

	//
	// B. Render components

	return (
		<DataTable
			columns={columns}
			onRowClick={item => realtimeCreateContext.actions.toggleRideSelection(item._id)}
			records={visibleRides}
			rowIdAccessor="_id"
			selectedIds={realtimeCreateContext.data.form.getValues().references?.map(reference => reference.parent_id) ?? []}
		/>
	);

	//
}
