'use client';

import { YearPeriodsListFiltersBar } from '@/components/year-periods/list/filters/YearPeriodsListFiltersBar';
import { YearPeriodsListCellAgencies } from '@/components/year-periods/list/table/YearPeriodsListCellAgencies';
import { YearPeriodsListCellName } from '@/components/year-periods/list/table/YearPeriodsListCellName';
import { YearPeriodsListHeader } from '@/components/year-periods/list/YearPeriodsListHeader';
import { type YearPeriodNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useYearPeriodsDetailYearPeriodId } from '../../detail/use-year-periods-detail-year-period-id';
import { useYearPeriodsListData } from '../use-year-periods-list-data';

/* * */

export function YearPeriodsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { yearPeriodId } = useYearPeriodsDetailYearPeriodId();

	const yearPeriodsData = useYearPeriodsListData();

	const columns: DataTableColumn<YearPeriodNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'name',
			render: item => <YearPeriodsListCellName color={item.color} value={item.name} />,
			title: 'Nome',
			width: 400,
		},
		{
			accessor: 'agency_ids_normalized',
			render: item => <YearPeriodsListCellAgencies value={item.agency_ids} />,
			title: 'Operadores',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: YearPeriodNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<YearPeriodsListHeader key="header" />, <YearPeriodsListFiltersBar key="filters" />]}>
			{yearPeriodsData.error && <ErrorDisplay message={yearPeriodsData.error} />}
			<DataTable
				columns={columns}
				isLoading={yearPeriodsData.isLoading}
				onRowClick={handleRowClick}
				records={yearPeriodsData.data}
				rowIdAccessor="_id"
				selectedId={yearPeriodId}
			/>
		</Pane>
	);
}
