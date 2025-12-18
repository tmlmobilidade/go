'use client';

/* * */

import { AlertsListCellDate } from '@/components/common/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/common/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/common/AlertsListCellMunicipalities';
import { AlertsListCellStops } from '@/components/common/AlertsListCellStops';
import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { AlertsListFiltersBar } from '@/components/scheduled/list/AlertsListFiltersBar';
import { AlertsListHeader } from '@/components/scheduled/list/AlertsListHeader';
import { useAlertListContext } from '@/contexts/AlertList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertsListContext = useAlertListContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.list' });

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'publish_status',
			render: item => <AlertTagPublishStatus value={item.publish_status} />,
			title: t('table_columns.status'),
			width: 150,

		},
		{
			accessor: 'title',
			title: t('table_columns.title'),
			width: 600,
		},
		{
			accessor: 'municipality_ids',
			render: item => <AlertsListCellMunicipalities values={item.municipality_ids} />,
			title: t('table_columns.municipality'),
			width: 300,
		},
		{
			accessor: 'publish_start_date',
			render: item => <AlertsListCellDate value={item.publish_start_date} />,
			title: t('table_columns.publish_start_date'),
			width: 300,
		},
		{
			accessor: 'publish_end_date',
			render: item => <AlertsListCellDate value={item.publish_end_date} />,
			title: t('table_columns.publish_end_date'),
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellLines values={getAvailableLines(item)} />,
			title: t('table_columns.lines'),
			width: 300,
		},
		{
			accessor: '_id',
			render: item => <AlertsListCellStops values={getAvailableStops(item)} />,
			title: t('table_columns.stops'),
			width: 800,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Alert) => {
		// Always redirect to the detail page for the selected alert, preserving URL params
		const destUrl = keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (alertsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (alertsListContext.flags.error) {
		return <ErrorDisplay message={alertsListContext.flags.error.message} />;
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
				selectedId={alertsListContext.data.selectedId}
			/>
		</Pane>
	);

	//
}
