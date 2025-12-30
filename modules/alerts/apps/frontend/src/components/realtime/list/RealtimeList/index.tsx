'use client';

/* * */

import { AlertsListCellDate } from '@/components/common/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/common/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/common/AlertsListCellMunicipalities';
import { AlertsListCellStops } from '@/components/common/AlertsListCellStops';
import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { RealtimeListHeader } from '@/components/realtime/list/RealtimeListHeader';
import { useRealtimeListContext } from '@/contexts/RealtimeList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const realtimeListContext = useRealtimeListContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.list' });

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'publish_status',
			render: item => <AlertTagPublishStatus value={item.publish_status} />,
			title: t('tableColumns.publishStatus'),
			width: 150,
		},
		{
			accessor: 'title',
			title: t('tableColumns.title'),
			width: 600,
		},
		{
			accessor: 'municipality_ids',
			render: item => <AlertsListCellMunicipalities values={item.municipality_ids} />,
			title: t('tableColumns.municipality'),
			width: 300,
		},
		{
			accessor: 'publish_start_date',
			render: item => <AlertsListCellDate value={item.publish_start_date} />,
			title: t('tableColumns.publishStartDate'),
			width: 300,
		},
		{
			accessor: 'publish_end_date',
			render: item => <AlertsListCellDate value={item.publish_end_date} />,
			title: t('tableColumns.publishEndDate'),
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellLines values={getAvailableLines(item)} />,
			title: t('tableColumns.lines'),
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellStops values={getAvailableStops(item)} />,
			title: t('tableColumns.stops'),
			width: 800,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Alert) => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.REALTIME_DETAIL(item._id)));
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
