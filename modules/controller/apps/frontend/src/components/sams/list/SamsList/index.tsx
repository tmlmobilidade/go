/* eslint-disable react/jsx-key */
'use client';

import { AnalysisTimeLineRow } from '@/components/common/AnalysisSams/AnalysisTimeLine';
import { SamsFilters } from '@/components/sams/list/SamsFilters';
import { SamsListHeader } from '@/components/sams/list/SamsHeader';
import { useSamsFavoritesContext } from '@/contexts/SamFavorites.context';
import { useSamsListContext } from '@/contexts/SamList.context';
import { translateFilterValue } from '@/lib/translations';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Sam } from '@tmlmobilidade/types';
import { AgencyTag, DataTable, DataTableColumn, IdTag, keepUrlParams, Label, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SamsList() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const samsFavoritesContext = useSamsFavoritesContext();
	const router = useRouter();

	const columns: DataTableColumn<Sam>[] = [
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
			render: item => <Tag label={translateFilterValue('sams_status', item.system_status)} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'analysis',
			render: item => (
				<AnalysisTimeLineRow
					analyses={item.analysis ?? []}
					rangeEndTs={item.seen_last_at}
					rangeStartTs={item.seen_first_at}
					remarks={item.remarks}
				/>
			),
			title: 'Análises',
			width: 600,
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
				records={samsListContext.flags.favoritesEnabled ? samsFavoritesContext.data.favoriteSams : samsListContext.data.raw}
			/>
		</Pane>
	);
}
