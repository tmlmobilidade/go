'use client';

import { HolidaysListCellAgencies } from '@/components/holidays/list/HolidaysListCellAgencies';
import { HolidaysListCellDates } from '@/components/holidays/list/HolidaysListCellDates';
import { HolidaysListFiltersBar } from '@/components/holidays/list/HolidaysListFiltersBar';
import { HolidaysListHeader } from '@/components/holidays/list/HolidaysListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useHolidaysDetailHolidayId } from '../../detail/use-holidays-detail-holiday-id';
import { useHolidaysListData } from '../use-holidays-list-data';

/* * */

export function HolidaysList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { holidayId } = useHolidaysDetailHolidayId();
	const { t } = useTranslation();

	const { data, error, isLoading } = useHolidaysListData();

	const columns: DataTableColumn<Holiday>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:holidays.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'title',
			title: t('default:holidays.list.columns.title'),
			width: 400,
		},
		{
			accessor: 'agency_ids',
			render: item => <HolidaysListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:holidays.list.columns.agency_ids'),
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <HolidaysListCellDates dates={item.dates} />,
			title: t('default:holidays.list.columns.dates'),
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Holiday) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (isLoading) {
		return (
			<LoadingOverlay />
		);
	}

	if (error) {
		return (
			<ErrorDisplay message={error} />
		);
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
				records={data}
				rowIdAccessor="_id"
				selectedId={holidayId}
			/>
		</Pane>
	);

	//
}
