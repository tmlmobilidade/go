'use client';

/* * */

import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { DataTable, DataTableColumn } from '@/components/datatable';
import { AlertsListFiltersBar } from '@/components/list/AlertsListFiltersBar';
import { AlertsListHeader } from '@/components/list/AlertsListHeader';
import { useAlertListContext } from '@/contexts/AlertList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { Routes } from '@/lib/routes';
import { type Alert } from '@tmlmobilidade/types';
import { LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import DateCell from '../DateCell';
import LineCell from '../LineCell';
import MunicipalityCell from '../MunicipalityCell';
import StopCell from '../StopCell';

/* * */

export function AlertList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertsListContext = useAlertListContext();

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'state',
			render: item => <AlertTagPublishStatus value={item.publish_status} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 600,
		},
		{
			accessor: 'municipality',
			render: ({ municipality_ids }) => (
				<MunicipalityCell municipality_ids={municipality_ids} />
			),
			title: 'Municípios',
			width: 230,
		},
		{
			accessor: 'lines',
			render: (alert) => {
				return <LineCell line_ids={getAvailableLines(alert)} />;
			},
			title: 'Linhas',
			width: 300,
		},
		{
			accessor: 'stops',
			render: (alert) => {
				return <StopCell stop_ids={getAvailableStops(alert)} />;
			},
			title: 'Paragens',
			width: 300,
		},
		{
			accessor: 'publish_start_date',
			render: ({ publish_end_date, publish_start_date }) => <DateCell date={publish_start_date} endDate={publish_end_date} />,
			title: 'Data de início',
			width: 150,
		},
		{
			accessor: 'publish_end_date',
			render: ({ publish_end_date }) => <DateCell date={publish_end_date} endDate={publish_end_date} />,
			title: 'Data de fim',
			width: 150,
		},
	];

	//
	// B. Render components

	if (alertsListContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (alertsListContext.flags.error) {
		return <div>Error: {alertsListContext.flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<AlertsListHeader />,
			<AlertsListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={alert => router.push(Routes.ALERT_DETAIL(alert._id))}
				records={alertsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
