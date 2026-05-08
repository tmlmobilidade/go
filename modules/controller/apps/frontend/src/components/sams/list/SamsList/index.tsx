/* eslint-disable react/jsx-key */
'use client';

import { AnalysisTimeLineRow } from '@/components/common/AnalysisSams/AnalysisTimeLine';
import { SamsFilters } from '@/components/sams/list/SamsFilters';
import { SamsListHeader } from '@/components/sams/list/SamsHeader';
import { type SamsListItem, useSamsListContext } from '@/contexts/SamList.context';
import { getSamSystemStatus } from '@/lib/sam-status';
import { translateFilterValue } from '@/lib/translations';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Sam } from '@tmlmobilidade/types';
import { AgencyTag, DataTable, DataTableColumn, IdTag, keepUrlParams, Label, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

/* * */

function SamsTimelineCell({ item }: { item: Sam | SamsListItem }) {
	const samsListContext = useSamsListContext();

	useEffect(() => {
		samsListContext.actions.trackVisibleSamIds([item._id]);
	}, [item._id, samsListContext.actions]);

	return (
		<AnalysisTimeLineRow
			rangeEndTs={item.seen_last_at}
			rangeStartTs={item.seen_first_at}
			timelineSummary={item.timeline_summary}
		/>
	);
}

export function SamsList() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const router = useRouter();

	const columns = useMemo<DataTableColumn<Sam | SamsListItem>[]>(() => [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 150,
		},
		{
			accessor: 'agency_id',
			render: item => <AgencyTag agencyId={item.agency_id} />,
			title: 'Operador',
			width: 80,
		},
		{
			accessor: 'latest_apex_version',
			render: item => item.latest_apex_version ? <Label>{item.latest_apex_version}</Label> : <Label>N/A</Label>,
			title: 'Versão APEX',
			width: 120,
		},
		{
			accessor: 'transactions_expected',
			render: item => item.transactions_expected ? <Label>{item.transactions_expected.toString()}</Label> : <Label>-</Label>,
			title: 'Transações esperadas',
			width: 180,
		},
		{
			accessor: 'transactions_found',
			render: item => item.transactions_found ? <Label>{item.transactions_found.toString()}</Label> : <Label>-</Label>,
			title: 'encontradas',
			width: 110,
		},
		{
			accessor: 'transactions_missing',
			render: item => item.transactions_missing ? <Label>{item.transactions_missing.toString()}</Label> : <Label>-</Label>,
			title: 'em falta',
			width: 120,
		},
		{
			accessor: 'system_status',
			render: item => (
				<Tag label={translateFilterValue('sams_status', getSamSystemStatus(item))} />
			),
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'timeline_summary',
			render: item => <SamsTimelineCell item={item} />,
			title: 'Análises',
			width: 600,
		},
	], []);

	//
	// B. Handle actions

	const handleRowClick = useCallback((item: Sam | SamsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.SAMS_DETAIL(item._id.toString())));
	}, [router]);

	const tableRecords = useMemo(
		() => samsListContext.data.filtered,
		[samsListContext.data.filtered],
	);

	//
	// C. Render components

	return (
		<Pane header={[
			<SamsListHeader />,
			<SamsFilters />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={tableRecords}
			/>
		</Pane>
	);
}
