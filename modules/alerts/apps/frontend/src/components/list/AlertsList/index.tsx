'use client';

/* * */

import { AlertsListCellCauseEffect } from '@/components/list/AlertsListCellCauseEffect';
import { AlertsListCellDate } from '@/components/list/AlertsListCellDate';
import { AlertsListCellLines } from '@/components/list/AlertsListCellLines';
import { AlertsListCellMunicipalities } from '@/components/list/AlertsListCellMunicipalities';
import { AlertsListCellReferenceType } from '@/components/list/AlertsListCellReferenceType';
import { AlertsListCellStops } from '@/components/list/AlertsListCellStops';
import { AlertsListFiltersBar } from '@/components/list/AlertsListFiltersBar';
import { AlertsListHeader } from '@/components/list/AlertsListHeader';
import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { getAvailableLines, getAvailableStops } from '@/lib/alert-utils';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, keepUrlParams, LoadingOverlay, Pane, PublishStatusTag } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function AlertsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const alertsListContext = useAlertsListContext();

	const columns: DataTableColumn<Alert>[] = [
		{
			accessor: 'agency_id',
			render: item => <AgencyTag agencyId={item.agency_id} showId />,
			title: 'Oper.',
			width: 55,
		},
		{
			accessor: 'publish_status',
			render: item => <PublishStatusTag value={item.publish_status} />,
			title: 'Estado',
			width: 125,
		},
		{
			accessor: 'reference_type',
			render: item => <AlertsListCellReferenceType value={item.reference_type} />,
			title: 'Tipo',
			width: 150,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 500,
		},
		{
			accessor: 'created_at',
			render: item => <AlertsListCellDate value={item.created_at} />,
			title: 'Data de criação',
			width: 225,
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
			accessor: 'cause',
			render: item => <AlertsListCellCauseEffect cause={item.cause} effect={item.effect} />,
			title: 'Causa & Efeito',
			width: 500,
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
		router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(item._id)));
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
		<Pane
			header={[
				<AlertsListHeader key="alerts-list-header" />,
				<AlertsListFiltersBar key="alerts-list-filters" />,
			]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={alertsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
