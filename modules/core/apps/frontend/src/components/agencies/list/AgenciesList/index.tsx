'use client';

import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { IdTag, keepUrlParams } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailAgencyId } from '../../detail/use-agencies-detail-agency-id';
import { type AgencyExtended, useAgenciesListData } from '../use-agencies-list-data';

/* * */

export function AgenciesList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { agencyId } = useAgenciesDetailAgencyId();

	const agenciesData = useAgenciesListData();

	const columns: DataTableColumn<AgencyExtended>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:agencies.list.Table.columns.id'),
			width: 80,
		},
		{
			accessor: 'code',
			render: item => <IdTag id={item.code} />,
			title: t('default:agencies.list.Table.columns.code'),
			width: 80,
		},
		{
			accessor: 'name',
			title: t('default:agencies.list.Table.columns.name'),
			width: 600,
		},
		{
			accessor: 'pta_name',
			title: t('default:agencies.list.Table.columns.pta_name'),
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: AgencyExtended) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.AGENCIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane
			header={[
				<AgenciesListHeader key="header" />,
			]}
		>
			{agenciesData.error && <ErrorDisplay message={agenciesData.error} />}
			<DataTable
				columns={columns}
				isLoading={agenciesData.isLoading}
				onRowClick={handleRowClick}
				records={agenciesData.data}
				rowIdAccessor="_id"
				selectedId={agencyId}
			/>
		</Pane>
	);
}
