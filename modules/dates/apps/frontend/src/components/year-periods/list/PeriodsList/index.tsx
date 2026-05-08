'use client';

import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { PeriodsListCellAgency } from '@/components/year-periods/list/PeriodsListCellAgency';
import { PeriodsListHeader } from '@/components/year-periods/list/PeriodsListHeader';
import { type PeriodNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ColorSwatch, DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { PeriodsListFiltersBar } from '../PeriodsListFiltersBar';

/* * */

export function PeriodsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const periodsListContext = usePeriodsListContext();

	const columns: DataTableColumn<PeriodNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'name',
			render: item => (
				<div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
					<ColorSwatch color={item.color || '#3b82f6'} size={14} />
					<Text>{item.name}</Text>
				</div>
			),
			title: 'Nome',
			width: 400,
		},
		{
			accessor: 'agency_ids_normalized',
			render: item => <PeriodsListCellAgency agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PeriodNormalized) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(item._id));
		router.push(destUrl);
	};

	//
	// C. Render components

	if (periodsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (periodsListContext.flags.error) {
		return <ErrorDisplay message={periodsListContext.flags.error.message} />;
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
				records={periodsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
