'use client';

import { RidesListCellDrivers } from '@/components/rides/list/RidesListCellDrivers';
import { RidesListCellHeadsign } from '@/components/rides/list/RidesListCellHeadsign';
import { RidesListCellPassengers } from '@/components/rides/list/RidesListCellPassengers';
import { RidesListCellVehicles } from '@/components/rides/list/RidesListCellVehicles';
import { RidesListFiltersBar } from '@/components/rides/list/RidesListFiltersBar';
import { RidesListHeader } from '@/components/rides/list/RidesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ControllerRidesListItem } from '@tmlmobilidade/go-controller-pckg-queries';
import { DataTable, DataTableColumn, ErrorDisplay, GradeStatusDisplay, OperationalDateDisplay, OperationalStatusDisplay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { RidesListCellDurationObserved } from '../RidesListCellDurationObserved';
import { RidesListCellDurationScheduled } from '../RidesListCellDurationScheduled';
import { RidesListCellSeenLastAt } from '../RidesListCellSeenLastAt';
import { RidesListCellTimeObserved } from '../RidesListCellTimeObserved';
import { RidesListCellTimeScheduled } from '../RidesListCellTimeScheduled';
import { useRidesListData } from './use-rides-list-data';

/* * */

export function RidesList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const ridesData = useRidesListData();

	const columns: DataTableColumn<ControllerRidesListItem>[] = [
		{
			accessor: 'seen_last_at',
			render: item => <RidesListCellSeenLastAt status={item.seen_status} timestamp={item.seen_last_at} />,
			title: t('default:list.RidesList.columns.seen_last_at.label'),
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusDisplay value={item.operational_status} />,
			title: t('default:list.RidesList.columns.operational_status.label'),
			width: 150,
		},
		{
			accessor: 'operational_date',
			render: item => <OperationalDateDisplay value={item.operational_date} />,
			title: t('default:list.RidesList.columns.operational_date.label'),
			width: 150,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.shape_id} />,
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
			render: item => <RidesListCellTimeScheduled timestamp={item.start_time_scheduled} />,
			title: t('default:list.RidesList.columns.start_time_scheduled.label'),
			width: 80,
		},
		{
			accessor: 'start_time_observed',
			render: item => (
				<RidesListCellTimeObserved
					delayStatus={item.start_delay_status}
					observedTimestamp={item.start_time_observed}
					scheduledTimestamp={item.start_time_scheduled}
				/>
			),
			title: t('default:list.RidesList.columns.start_time_observed.label'),
			width: 300,
		},
		{
			accessor: 'end_time_scheduled',
			render: item => <RidesListCellTimeScheduled timestamp={item.end_time_scheduled} />,
			title: t('default:list.RidesList.columns.end_time_scheduled.label'),
			width: 80,
		},
		{
			accessor: 'end_time_observed',
			render: item => item.operational_status === 'ended' && (
				<RidesListCellTimeObserved
					delayStatus={item.end_delay_status}
					observedTimestamp={item.end_time_observed}
					scheduledTimestamp={item.end_time_scheduled}
				/>
			),
			title: t('default:list.RidesList.columns.end_time_observed.label'),
			width: 300,
		},

		{
			accessor: 'duration_scheduled',
			render: item => item.operational_status === 'ended' && (
				<RidesListCellDurationScheduled
					endTimeScheduled={item.end_time_scheduled}
					startTimeScheduled={item.start_time_scheduled}
				/>
			),
			title: t('default:list.RidesList.columns.duration_scheduled.label'),
			width: 100,
		},
		{
			accessor: 'duration_observed',
			render: item => item.operational_status === 'ended' && (
				<RidesListCellDurationObserved
					endTimeObserved={item.end_time_observed}
					endTimeScheduled={item.end_time_scheduled}
					startTimeObserved={item.start_time_observed}
					startTimeScheduled={item.start_time_scheduled}
				/>
			),
			title: t('default:list.RidesList.columns.duration_observed.label'),
			width: 200,
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
			render: item => item.operational_status === 'ended' && <GradeStatusDisplay value={item.analysis_simple_three_vehicle_events_grade} />,
			title: '3 Eventos',
			width: 100,
		},
		{
			accessor: 'analysis_at_least_one_vehicle_event_on_last_stop_grade',
			render: item => item.operational_status === 'ended' && <GradeStatusDisplay value={item.analysis_at_least_one_vehicle_event_on_last_stop_grade} />,
			title: 'Last Stop',
			width: 100,
		},
		{
			accessor: 'analysis_expected_apex_validation_interval_grade',
			render: item => item.operational_status === 'ended' && <GradeStatusDisplay value={item.analysis_expected_apex_validation_interval_grade} />,
			title: 'Int. APEX',
			width: 100,
		},
		{
			accessor: 'analysis_transaction_sequentiality_grade',
			render: item => item.operational_status === 'ended' && <GradeStatusDisplay value={item.analysis_transaction_sequentiality_grade} />,
			title: 'Seq. APEX',
			width: 120,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: ControllerRidesListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.RIDES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<RidesListHeader key="header" />,
			<RidesListFiltersBar key="filters" />,
		]}
		>
			{ridesData.error && <ErrorDisplay message={ridesData.error} />}
			<DataTable
				columns={columns}
				isLoading={ridesData.isLoading}
				onRowClick={handleRowClick}
				records={ridesData.data}
				rowIdAccessor="_id"
				selectedId={decodeURIComponent(params.id ?? '')}
			/>
		</Pane>
	);
}
