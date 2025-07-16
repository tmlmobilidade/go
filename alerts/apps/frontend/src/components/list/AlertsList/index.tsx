'use client';

/* * */

import { AlertsListFilters } from '@/components/list/AlertsList/AlertsListFilters';
import { AlertsListHeader } from '@/components/list/AlertsListHeader';
import { useAlertListContext } from '@/contexts/AlertList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { Routes } from '@/lib/routes';
import { type Alert } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import DateCell from '../DateCell';
import LineCell from '../LineCell';
import MunicipalityCell from '../MunicipalityCell';
import StatusCell from '../StatusCell';
import StopCell from '../StopCell';

/* * */

export function AlertList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = useAlertListContext();

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'state',
			render: ({ publish_status }) => <StatusCell status={publish_status} />,
			title: 'Estado',
			width: 150,
		},
		{ accessor: 'title', title: 'Título', width: 400 },
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

	if (flags.isLoading) {
		return <div>Loading...</div>;
	}
	else if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<AlertsListHeader />,
			<AlertsListFilters />,
		]}
		>
			<DataTable
				columns={columns}
				records={data.filtered}
				rowIdAccessor="_id"
				onRowClick={(alert) => {
					router.push(Routes.ALERT_DETAIL(alert._id));
				}}
			/>
		</Pane>
	);

	//
}
