'use client';

import { useHolidaysListContext } from '@/components/holidays/list/HolidaysList.context';
import { HolidaysListCellAgencies } from '@/components/holidays/list/HolidaysListCellAgencies';
import { HolidaysListCellDates } from '@/components/holidays/list/HolidaysListCellDates';
import { HolidaysListFiltersBar } from '@/components/holidays/list/HolidaysListFiltersBar';
import { HolidaysListHeader } from '@/components/holidays/list/HolidaysListHeader';
import { type HolidayNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function HolidaysList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const holidaysListContext = useHolidaysListContext();

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
			render: item => <HolidaysListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <HolidaysListCellDates dates={item.dates} />,
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

	if (holidaysListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (holidaysListContext.flags.error) {
		return <ErrorDisplay message={holidaysListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<HolidaysListHeader key="header" />,
			<HolidaysListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={holidaysListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
