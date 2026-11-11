'use client';

import { AgenciesListHeader } from '@/components/agencies/list/AgenciesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type AgenciesListItem } from '@tmlmobilidade/go-core-pckg-types';
import { IdTag, keepUrlParams, TagGroup } from '@tmlmobilidade/ui';
import { DataTable, type DataTableColumn, ErrorDisplay, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailAgencyId } from '../../detail/use-agencies-detail-agency-id';
import { useAgenciesOrganizationsData } from '../../shared/use-agencies-organizations-data';
import { AgenciesListFiltersBar } from '../filters/AgenciesListFiltersBar';
import { useAgenciesListData } from '../use-agencies-list-data';

/* * */

export function AgenciesList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { agencyId } = useAgenciesDetailAgencyId();

	const agenciesData = useAgenciesListData();

	const organizationsData = useAgenciesOrganizationsData();

	const columns: DataTableColumn<AgenciesListItem>[] = [
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
			accessor: 'organizations',
			render: item => <TagGroup tags={organizationsData.data.filter(organization => organization.agency_ids?.includes(item._id)).map(organization => ({ label: organization.short_name, tooltip: organization.long_name }))} />,
			title: t('default:agencies.list.Table.columns.organizations'),
			width: 250,
		},
		{
			accessor: 'pta_name',
			title: t('default:agencies.list.Table.columns.pta_name'),
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: AgenciesListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.AGENCIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<AgenciesListHeader key="header" />, <AgenciesListFiltersBar key="filters" />]}>
			{agenciesData.error && <ErrorDisplay message={agenciesData.error} />}
			{organizationsData.error && <ErrorDisplay message={organizationsData.error} />}
			<DataTable
				columns={columns}
				isLoading={agenciesData.isLoading || organizationsData.isLoading}
				onRowClick={handleRowClick}
				records={agenciesData.data}
				rowIdAccessor="_id"
				selectedId={agencyId}
			/>
		</Pane>
	);
}
