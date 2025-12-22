'use client';

/* * */

import { AlertsListCellDate } from '@/components/common/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/common/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/common/AlertsListCellMunicipalities';
import { AlertsListCellStops } from '@/components/common/AlertsListCellStops';
import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { ScheduledListFiltersBar } from '@/components/scheduled/list/ScheduledListFiltersBar';
import { ScheduledListHeader } from '@/components/scheduled/list/ScheduledListHeader';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function AlertList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const scheduledListContext = useScheduledListContext();

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'publish_status',
			render: item => <AlertTagPublishStatus value={item.publish_status} />,
			title: 'Estado',
			width: 125,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 500,
		},
		{
			accessor: 'publish_start_date',
			render: item => <AlertsListCellDate value={item.publish_start_date} />,
			title: 'Data de início',
			width: 225,
		},
		{
			accessor: 'publish_end_date',
			render: item => <AlertsListCellDate value={item.publish_end_date} />,
			title: 'Data de fim',
			width: 225,
		},
		{
			accessor: 'municipality_ids',
			render: item => <AlertsListCellMunicipalities values={item.municipality_ids} />,
			title: 'Municípios',
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellLines values={getAvailableLines(item)} />,
			title: 'Linhas',
			width: 175,
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
		router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (scheduledListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (scheduledListContext.flags.error) {
		return <ErrorDisplay message={scheduledListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<ScheduledListHeader />,
			<ScheduledListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={scheduledListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
