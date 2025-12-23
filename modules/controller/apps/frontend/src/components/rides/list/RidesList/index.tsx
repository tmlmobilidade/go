'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { OperationalDateTag } from '@/components/common/OperationalDateTag';
import { OperationalStatusTag } from '@/components/common/OperationalStatusTag';
import { SeenStatusTag } from '@/components/common/SeenStatusTag';
import { StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { RidesListCellHeadsign } from '@/components/rides/list/RidesListCellHeadsign';
import { RidesListCellPassengers } from '@/components/rides/list/RidesListCellPassengers';
import { RidesListFiltersBar } from '@/components/rides/list/RidesListFiltersBar';
import { RidesListHeader } from '@/components/rides/list/RidesListHeader';
import { useRidesListContext } from '@/contexts/RidesList.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, keepUrlParams, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const ridesListContext = useRidesListContext();
	const { t } = useTranslation('controller', { keyPrefix: 'rides.list' });

	const formatTimestamp = (timestamp: UnixTimestamp) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt') : null;
	};

	const columns: DataTableColumn<RideNormalized>[] = [
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusTag value={item.seen_status} />,
			title: t('tableColumns.seen_last_at'),
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusTag value={item.operational_status} />,
			title: t('tableColumns.operational_status'),
			width: 150,
		},
		{
			accessor: 'operational_date',
			render: item => <OperationalDateTag value={item.operational_date} />,
			title: t('tableColumns.operational_date'),
			width: 150,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.pattern_id} />,
			title: t('tableColumns.headsign'),
			width: 500,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: t('tableColumns.start_time_scheduled'),
			width: 80,
		},
		{
			accessor: 'start_time_observed',
			render: item => <StartTimeStatusTag startTimeObserved={formatTimestamp(item.start_time_observed)} status={item.start_delay_status} />,
			title: t('tableColumns.start_time_observed'),
			width: 200,
		},
		{
			accessor: 'passengers_observed',
			render: item => <RidesListCellPassengers value={item.passengers_observed} />,
			title: t('tableColumns.passengers_observed'),
			width: 120,
		},
		{
			accessor: 'analysis_simple_three_vehicle_events_grade',
			render: item => <AnalysisStatusTag grade={item.analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade} />,
			title: t('tableColumns.analysis_simple_three_vehicle_events_grade'),
			width: 120,
		},
		{
			accessor: 'analysis_ended_at_last_stop_grade',
			render: item => <AnalysisStatusTag grade={item.analysis.ENDED_AT_LAST_STOP.grade} />,
			title: t('tableColumns.analysis_ended_at_last_stop_grade'),
			width: 120,
		},
		{
			accessor: 'analysis_expected_apex_validation_interval',
			render: item => <AnalysisStatusTag grade={item.analysis.EXPECTED_APEX_VALIDATION_INTERVAL.grade} />,
			title: t('tableColumns.analysis_expected_apex_validation_interval_grade'),
			width: 120,
		},
		{
			accessor: 'analysis_transaction_sequentiality',
			render: item => <AnalysisStatusTag grade={item.analysis.TRANSACTION_SEQUENTIALITY.grade} />,
			title: t('tableColumns.analysis_transaction_sequentiality'),
			width: 120,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: RideNormalized) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.controller.RIDES_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

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
				selectedId={ridesListContext.data.selectedRideId}
			/>
		</Pane>
	);

	//
}
