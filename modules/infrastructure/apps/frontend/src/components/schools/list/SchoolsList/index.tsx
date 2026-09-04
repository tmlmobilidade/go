'use client';

import { useSchoolsDetailSchoolId } from '@/components/schools/detail/use-schools-detail-school-id';
import { SchoolsListFiltersBar } from '@/components/schools/list/filters/SchoolsListFiltersBar';
import { SchoolsListHeader } from '@/components/schools/list/SchoolsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type SchoolsListItem } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useSchoolsListData } from '../use-schools-list-data';

/* * */

export function SchoolsList() {
	//

	//
	// A. Setup variables

	const { schoolId } = useSchoolsDetailSchoolId();

	const router = useRouter();
	const { t } = useTranslation();

	const schoolsData = useSchoolsListData();

	const columns: DataTableColumn<SchoolsListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('schools:list.SchoolsList.columns.id.label'),
			width: 100,
		},
		{
			accessor: 'name',
			title: t('schools:list.SchoolsList.columns.name.label'),
			width: 500,
		},
		{
			accessor: 'municipality_name',
			title: t('schools:list.SchoolsList.columns.municipality_name.label'),
			width: 250,
		},
		{
			accessor: 'grouping',
			title: t('schools:list.SchoolsList.columns.grouping.label'),
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: SchoolsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane
			header={[
				<SchoolsListHeader key="header" />,
				<SchoolsListFiltersBar key="filters" />,
			]}
		>
			{schoolsData.error && <ErrorDisplay message={schoolsData.error} />}
			<DataTable
				columns={columns}
				isLoading={schoolsData.isLoading}
				onRowClick={handleRowClick}
				records={schoolsData.data}
				rowIdAccessor="_id"
				selectedId={schoolId}
			/>
		</Pane>
	);
}
