'use client';

/* * */

import { PeriodsListCellAgency } from '@/components/periods/list/PeriodsListCellAgency';
import { PeriodsListHeader } from '@/components/periods/list/PeriodsListHeader';
import { usePeriodsListContext } from '@/contexts/PeriodsList.context';
import { type PeriodNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ColorSwatch, DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag, Text } from '@tmlmobilidade/ui';
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
			render: item => <Tag label={item._id} variant="secondary" />,
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
			accessor: 'agency_id_normalized',
			render: item => <PeriodsListCellAgency agencyId={item.agency_id} />,
			title: 'Operador',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PeriodNormalized) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.dates.PERIODS_DETAIL(item._id), window.location.search);
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
			<PeriodsListHeader />,
			<PeriodsListFiltersBar />,
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
