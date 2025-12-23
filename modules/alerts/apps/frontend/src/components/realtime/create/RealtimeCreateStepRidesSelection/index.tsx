'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { RidesData } from '@/hooks/Rides.context';
import { Checkbox, DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RealtimeCreateStepRidesSelection() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	const columns: DataTableColumn<RidesData>[] = [
		{
			accessor: '_id',
			render: item => <Checkbox checked={realtimeCreateContext.data.form.getValues().references?.some(reference => reference.parent_id === item._id) ?? false} />,
			title: '',
			width: 50,
		},
		{
			accessor: 'pattern_id',
			title: 'Título',
			width: 100,
		},
		{
			accessor: 'headsign',
			title: 'Título',
			width: 400,
		},
		{
			accessor: 'start_time_scheduled',
			title: 'Título',
			width: 200,
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
