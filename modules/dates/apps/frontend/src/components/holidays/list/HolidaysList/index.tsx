'use client';

import { HolidaysListFiltersBar } from '@/components/holidays/list/filters/HolidaysListFiltersBar';
import { HolidaysListHeader } from '@/components/holidays/list/HolidaysListHeader';
import { HolidaysListCellAgencies } from '@/components/holidays/list/table/HolidaysListCellAgencies';
import { HolidaysListCellDates } from '@/components/holidays/list/table/HolidaysListCellDates';
import { type HolidayNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useHolidaysDetailHolidayId } from '../../detail/use-holidays-detail-holiday-id';
import { useHolidaysListData } from '../use-holidays-list-data';

/* * */

export function HolidaysList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { holidayId } = useHolidaysDetailHolidayId();

	const holidaysData = useHolidaysListData();

	const columns: DataTableColumn<HolidayNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'title',
			title: 'Título',
			width: 400,
		},
		{
			accessor: 'agency_ids_normalized',
			render: item => <HolidaysListCellAgencies value={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <HolidaysListCellDates value={item.dates} />,
			title: 'Datas',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: HolidayNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<HolidaysListHeader key="header" />, <HolidaysListFiltersBar key="filters" />]}>
			{holidaysData.error && <ErrorDisplay message={holidaysData.error} />}
			<DataTable
				columns={columns}
				isLoading={holidaysData.isLoading}
				onRowClick={handleRowClick}
				records={holidaysData.data}
				rowIdAccessor="_id"
				selectedId={holidayId}
			/>
		</Pane>
	);
}
