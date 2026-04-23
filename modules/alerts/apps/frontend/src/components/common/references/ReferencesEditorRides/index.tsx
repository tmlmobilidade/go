'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorRidesFilters } from '@/components/common/references/ReferencesEditorRidesFilters';
import { RidesListCellHeadsign } from '@/components/create/RidesListCellHeadsign';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Checkbox, DataTable, DataTableColumn, NoDataLabel, OperationalStatusTag, Section, SeenStatusIndicator, Surface, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function ReferencesEditorRides() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	const formatTimestamp = (timestamp: UnixTimestamp) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt') : null;
	};

	const columns: DataTableColumn<RideNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Checkbox checked={referencesEditorContext.data.selected_references?.some(reference => reference.parent_id === item._id) ?? false} />,
			title: '',
			width: 50,
		},
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusIndicator status={item.seen_status} />,
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
			accessor: 'start_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: 'Partida',
			width: 80,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.pattern_id} />,
			title: 'Pattern',
			width: 500,
		},
	];

	//
	// B. Transform data

	const visibleRides = useMemo(() => {
		if (referencesEditorContext.filters.view_mode.value === 'selected') {
			return referencesEditorContext.data.selected_rides_data;
		}
		return referencesEditorContext.data.rides;
	}, [
		referencesEditorContext.data.rides,
		referencesEditorContext.data.selected_rides_data,
		referencesEditorContext.filters.view_mode.value,
	]);

	//
	// C. Render components

	return (
		<>

			<ReferencesEditorRidesFilters />

			{!visibleRides.length && (
				<Section>
					<Surface>
						<Section alignItems="center">
							<NoDataLabel text="Nenhuma circulação selecionada" />
						</Section>
					</Surface>
				</Section>
			)}

			{visibleRides.length > 0 && (
				<DataTable
					columns={columns}
					onRowClick={item => referencesEditorContext.actions.toggleRideSelection(item._id)}
					records={visibleRides}
					rowIdAccessor="_id"
					selectedIds={referencesEditorContext.data.selected_references?.map(reference => reference.parent_id) ?? []}
					withTopBorder
				/>
			)}

		</>
	);

	//
}
