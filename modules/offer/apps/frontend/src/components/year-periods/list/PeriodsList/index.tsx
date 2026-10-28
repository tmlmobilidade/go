'use client';

import { PeriodsListCellAgency } from '@/components/year-periods/list/PeriodsListCellAgency';
import { PeriodsListHeader } from '@/components/year-periods/list/PeriodsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { ColorSwatch, DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { usePeriodsDetailYearPeriodId } from '../../detail/use-periods-detail-year-period-id';
import { PeriodsListFiltersBar } from '../PeriodsListFiltersBar';
import { usePeriodsListData } from '../use-periods-list-data';

/* * */

export function PeriodsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, error, isLoading } = usePeriodsListData();
	const { yearPeriodId } = usePeriodsDetailYearPeriodId();
	const { t } = useTranslation();

	const columns: DataTableColumn<YearPeriod>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:periods.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'name',
			render: item => (
				<div className={styles.name}>
					<ColorSwatch color={item.color || '#3b82f6'} size={14} />
					<Text>{item.name}</Text>
				</div>
			),
			title: t('default:periods.list.columns.name'),
			width: 400,
		},
		{
			accessor: 'agency_ids',
			render: item => <PeriodsListCellAgency agencyIds={item.agency_ids} />,
			title: t('default:periods.list.columns.agency_ids'),
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: YearPeriod) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_DETAIL(item._id));
		router.push(destUrl);
	};

	//
	// C. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[
			<PeriodsListHeader key="header" />,
			<PeriodsListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={yearPeriodId}
			/>
		</Pane>
	);

	//
}
