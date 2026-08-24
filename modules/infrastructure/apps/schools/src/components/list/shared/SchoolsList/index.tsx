'use client';

import { useSchoolsDetailSchoolId } from '@/components/detail/shared/use-schools-detail-school-id';
import { SchoolsListFiltersBar } from '@/components/list/filters/SchoolsListFiltersBar';
import { SchoolsListHeader } from '@/components/list/shared/SchoolsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type SchoolsListItem } from '@tmlmobilidade/go-schools-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useSchoolsListData } from '../use-schools-list-data';

/* * */

export function SchoolsList() {
	//

	//
	// A. Setup variables

	const { schoolId } = useSchoolsDetailSchoolId();

	const router = useRouter();

	const schoolsData = useSchoolsListData();

	const columns: DataTableColumn<SchoolsListItem>[] = [

	];

	//
	// B. Handle actions

	const handleRowClick = (item: SchoolsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.schools.SCHOOLS_DETAIL(item._id)));
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
