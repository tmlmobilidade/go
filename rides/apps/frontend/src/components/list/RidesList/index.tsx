'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { OperationalStatusTag } from '@/components/common/OperationalStatusTag';
import { SeenStatusTag } from '@/components/common/SeenStatusTag';
import { StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { RidesListCellHeadsign } from '@/components/list/RidesListCellHeadsign';
import { RidesListCellPassengers } from '@/components/list/RidesListCellPassengers';
import { RidesListFiltersBar } from '@/components/list/RidesListFiltersBar';
import { RidesListHeader } from '@/components/list/RidesListHeader';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { type RideNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function RidesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const ridesListContext = useRidesListContext();

	const columns: DataTableColumn<RideNormalized>[] = [
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
			accessor: 'start_time_scheduled_display',
			render: item => <Tag label={item.start_time_scheduled_display} variant="muted" />,
			title: 'Partida',
			width: 100,
		},
		{
			accessor: 'start_time_observed_display',
			render: item => <StartTimeStatusTag startTimeObserved={item.start_time_observed_display} status={item.delay_status} />,
			title: 'Observado',
			width: 200,
		},
		{
			accessor: 'passengers_observed',
			render: item => <RidesListCellPassengers value={item.passengers_observed} />,
			title: 'Validações',
			width: 100,
		},
		{
			accessor: 'simple_three_vehicle_events_grade',
			render: item => <AnalysisStatusTag grade={item.simple_three_vehicle_events_grade} operationalStatus={item.operational_status} />,
			title: '3 Eventos',
			width: 150,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: RideNormalized) => {
		const destUrl = keepUrlParams(`/rides/${item._id}`, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (ridesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (ridesListContext.flags.error) {
		return <ErrorDisplay message={ridesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<RidesListHeader />,
			<RidesListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={ridesListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
