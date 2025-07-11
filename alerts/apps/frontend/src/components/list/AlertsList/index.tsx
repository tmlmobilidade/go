'use client';

/* * */

import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { AlertsListCellDate } from '@/components/list/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/list/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/list/AlertsListCellMunicipalities';
import { AlertsListCellStops } from '@/components/list/AlertsListCellStops';
import { AlertsListFiltersBar } from '@/components/list/AlertsListFiltersBar';
import { AlertsListHeader } from '@/components/list/AlertsListHeader';
import { useAlertListContext } from '@/contexts/AlertList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { Routes } from '@/lib/routes';
import { type Alert } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function AlertList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertsListContext = useAlertListContext();

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'publish_status',
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
			accessor: 'municipality_ids',
			render: item => <AlertsListCellMunicipalities values={item.municipality_ids} />,
			title: 'Municípios',
			width: 300,
		},
		{
			accessor: 'publish_start_date',
			render: item => <AlertsListCellDate value={item.publish_start_date} />,
			title: 'Data de início',
			width: 300,
		},
		{
			accessor: 'publish_end_date',
			render: item => <AlertsListCellDate value={item.publish_end_date} />,
			title: 'Data de fim',
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellLines values={getAvailableLines(item)} />,
			title: 'Linhas',
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellStops values={getAvailableStops(item)} />,
			title: 'Paragens',
			width: 800,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (alert: Alert) => {
		const destUrl = keepUrlParams(Routes.ALERT_DETAIL(alert._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (alertsListContext.flags.loading) {
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
				onRowClick={handleRowClick}
				records={alertsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
