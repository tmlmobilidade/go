'use client';

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { OperationalDateTag } from '@/components/common/OperationalDateTag';
import { StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { RidesListCellDrivers } from '@/components/rides/list/RidesListCellDrivers';
import { RidesListCellHeadsign } from '@/components/rides/list/RidesListCellHeadsign';
import { RidesListCellPassengers } from '@/components/rides/list/RidesListCellPassengers';
import { RidesListCellVehicles } from '@/components/rides/list/RidesListCellVehicles';
import { RidesListFiltersBar } from '@/components/rides/list/RidesListFiltersBar';
import { RidesListHeader } from '@/components/rides/list/RidesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, OperationalStatusTag, Pane, Section, SeenStatusIndicator, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const ridesListContext = useRidesListContext();
	const { t } = useTranslation();

	const formatTimestamp = (timestamp: UnixTimestamp) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt') : null;
	};

	const formatDuration = (startTimestamp: null | UnixTimestamp, endTimestamp: null | UnixTimestamp) => {
		if (!startTimestamp || !endTimestamp) return null;

		return Math.round((endTimestamp - startTimestamp) / 60) + ' min';
	};

	const formatDurationDeviation = (item: RideNormalized) => {
		if (!item.start_time_observed || !item.end_time_observed) return null;

		const plannedDuration = item.end_time_scheduled - item.start_time_scheduled;
		const observedDuration = item.end_time_observed - item.start_time_observed;
		const deviationInMinutes = Math.round((observedDuration - plannedDuration) / 60000);

		if (deviationInMinutes === 0) return '0 min';
		return `${deviationInMinutes > 0 ? '+' : ''}${deviationInMinutes} min`;
	};

	const columns: DataTableColumn<RideNormalized>[] = [
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusIndicator status={item.seen_status} tooltip={formatTimestamp(item.seen_last_at)} />,
			title: t('default:list.RidesList.columns.seen_last_at.label'),
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusTag value={item.operational_status} />,
			title: t('default:list.RidesList.columns.operational_status.label'),
			width: 150,
		},
		{
			accessor: 'operational_date',
			render: item => <OperationalDateTag value={item.operational_date} />,
			title: t('default:list.RidesList.columns.operational_date.label'),
			width: 150,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.pattern_id} />,
			title: t('default:list.RidesList.columns.headsign.label'),
			width: 500,
		},
		{
			accessor: 'passengers_observed',
			render: item => <RidesListCellPassengers value={item.passengers_observed} />,
			title: t('default:list.RidesList.columns.passengers_observed.label'),
			width: 80,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: t('default:list.RidesList.columns.start_time_scheduled.label'),
			width: 80,
		},
		{
			accessor: 'start_time_observed',
			render: item => (
				<StartTimeStatusTag
					delayValue={item.start_delay_value_display}
					startTimeObserved={formatTimestamp(item.start_time_observed)}
					status={item.start_delay_status}
				/>
			),
			title: t('default:list.RidesList.columns.start_time_observed.label'),
			width: 180,
		},
		{
			accessor: 'end_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.end_time_scheduled)} variant="muted" />,
			title: t('default:list.RidesList.columns.end_time_scheduled.label'),
			width: 80,
		},
		{
			accessor: 'end_time_observed',
			render: item => item.operational_status === 'ended'
				? (
					<StartTimeStatusTag
						delayValue={item.end_delay_value_display}
						startTimeObserved={formatTimestamp(item.end_time_observed)}
						status={item.end_delay_status}
					/>
				)
				: null,
			title: t('default:list.RidesList.columns.end_time_observed.label'),
			width: 180,
		},

		{
			accessor: 'end_time_scheduled',
			render: (item) => {
				const duration = formatDuration(item.start_time_scheduled, item.end_time_scheduled);
				if (!duration) return null;

				return <Tag label={duration} variant="muted" />;
			},
			title: t('default:list.RidesList.columns.duration_scheduled.label'),
			width: 80,
		},
		{
			accessor: 'end_time_observed',
			render: (item) => {
				const duration = formatDuration(item.start_time_observed, item.end_time_observed);
				const deviation = formatDurationDeviation(item);

				if (!duration && !deviation) return null;

				return (
					<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
						{duration && <Tag label={duration} variant="secondary" />}
						{deviation && <Tag label={deviation} variant="warning" />}
					</Section>
				);
			},
			title: t('default:list.RidesList.columns.duration_observed.label'),
			width: 160,
		},

		{
			accessor: 'driver_ids',
			render: item => <RidesListCellDrivers value={item.driver_ids} />,
			title: t('default:list.RidesList.columns.driver_ids.label'),
			width: 120,
		},
		{
			accessor: 'vehicle_ids',
			render: item => <RidesListCellVehicles value={item.vehicle_ids} />,
			title: t('default:list.RidesList.columns.vehicle_ids.label'),
			width: 120,
		},
		{
			accessor: 'analysis_simple_three_vehicle_events_grade',
			render: item => item.operational_status === 'ended' ? <AnalysisStatusTag grade={item.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade} /> : null,
			title: '3 Eventos',
			width: 100,
		},
		{
			accessor: 'analysis_ended_at_last_stop_grade',
			render: item => item.operational_status === 'ended' ? <AnalysisStatusTag grade={item.analysis?.ENDED_AT_LAST_STOP?.grade} /> : null,
			title: 'Last Stop',
			width: 100,
		},
		{
			accessor: 'analysis_expected_apex_validation_interval',
			render: item => item.operational_status === 'ended' ? <AnalysisStatusTag grade={item.analysis?.EXPECTED_APEX_VALIDATION_INTERVAL?.grade} /> : null,
			title: 'Int. APEX',
			width: 100,
		},
		{
			accessor: 'analysis_transaction_sequentiality',
			render: item => item.operational_status === 'ended' ? <AnalysisStatusTag grade={item.analysis?.TRANSACTION_SEQUENTIALITY?.grade} /> : null,
			title: 'Seq. APEX',
			width: 120,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: RideNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (ridesListContext.flags.error) {
		return <ErrorDisplay message={ridesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<RidesListHeader key="header" />,
			<RidesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={ridesListContext.flags.favoritesEnabled ? ridesListContext.data.filteredByFavoriteIds : ridesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={decodeURIComponent(params.id ?? '')}
			/>
		</Pane>
	);

	//
}
