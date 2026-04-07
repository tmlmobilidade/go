/* eslint-disable react/jsx-key */
'use client';

import { SamsFilters } from '@/components/sams/list/SamsFilters';
import { SamsListHeader } from '@/components/sams/list/SamsListHeader';
import { useSamsListContext } from '@/contexts/SamsList.context';
import { formatUnixTimestampToDateString } from '@/lib/utils';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Sam } from '@tmlmobilidade/types';
import { AgencyTag, AnalysisTimeLineRow, DataTable, DataTableColumn, IdTag, keepUrlParams, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SamsList() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const router = useRouter();

	const columns: DataTableColumn<Sam>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} copyOnClick />,
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
			render: item => <Tag label={item.latest_apex_version ?? 'N/A'} />,
			title: 'Versão APEX',
			width: 100,
		},
		{
			accessor: 'transactions_expected',
			render: item => <Tag label={item.transactions_expected ? item.transactions_expected.toString() : '-'} />,
			title: 'Transações esperadas',
			width: 180,
		},
		{
			accessor: 'transactions_found',
			render: item => <Tag label={item.transactions_found ? item.transactions_found.toString() : '-'} />,
			title: 'Transações encontradas',
			width: 200,
		},
		{
			accessor: 'transactions_missing',
			render: item => <Tag label={item.transactions_missing ? item.transactions_missing.toString() : '-'} />,
			title: 'Transações em falta',
			width: 180,
		},
		{
			accessor: 'seen_first_at',
			render: item => <Tag label={formatUnixTimestampToDateString(item.seen_first_at)} />,
			title: 'Primeira vista',
			width: 180,
		},
		{
			accessor: 'seen_last_at',
			render: item => <Tag label={formatUnixTimestampToDateString(item.seen_last_at)} />,
			title: 'Última vista',
			width: 180,
		},
		{
			accessor: 'system_status',
			render: item => <Tag label={item.system_status} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'analysis',
			render: item => <AnalysisTimeLineRow analyses={item.analysis ?? []} />,
			title: 'Análises',
			width: 800,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Sam) => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.SAMS_DETAIL(item._id.toString())));
	};

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
				records={samsListContext.data.filtered}
			/>
		</Pane>
	);
}
