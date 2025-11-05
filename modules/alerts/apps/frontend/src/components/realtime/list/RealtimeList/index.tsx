'use client';

/* * */

import { AlertsListCellDate } from '@/components/common/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/common/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/common/AlertsListCellMunicipalities';
import { AlertsListCellStops } from '@/components/common/AlertsListCellStops';
import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { useRealtimeListContext } from '@/contexts/RealtimeList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { Routes } from '@/lib/routes';
import { type Alert } from '@go/types';
import { keepUrlParams } from '@go/utils';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@go/ui';
import { useRouter } from 'next/navigation';

import { RealtimeListHeader } from '../AlertsListHeader';

/* * */

export function RealtimeList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const realtimeListContext = useRealtimeListContext();

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

	const handleRowClick = (item: Alert) => {
		// Check if url is /realtime
		if (window.location.pathname.includes('realtime')) {
			const destUrl = keepUrlParams(Routes.REALTIME_DETAIL(item._id), window.location.search);
			router.push(destUrl);
		}
		else {
			const destUrl = keepUrlParams(Routes.REALTIME_DETAIL(item._id), window.location.search);
			router.push(destUrl);
		}
	};

	//
	// C. Render components

	if (realtimeListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (realtimeListContext.flags.error) {
		return <ErrorDisplay message={realtimeListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<RealtimeListHeader />,
			// <RealtimeListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={realtimeListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={realtimeListContext.data.selectedId}
			/>
		</Pane>
	);

	//
}
