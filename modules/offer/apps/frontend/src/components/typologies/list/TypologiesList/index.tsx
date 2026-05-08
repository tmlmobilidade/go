'use client';

import { useTypologiesListContext } from '@/components/typologies/list/TypologiesList.context';
import { TypologiesListCellAgencies } from '@/components/typologies/list/TypologiesListCellAgencies';
import { TypologiesListFiltersBar } from '@/components/typologies/list/TypologiesListFiltersBar';
import { TypologiesListHeader } from '@/components/typologies/list/TypologiesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Typology } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LineBadge, LoadingOverlay, Pane, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function TypologiesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const typologiesList = useTypologiesListContext();

	const columns: DataTableColumn<Typology>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <Text>{item.code}</Text>,
			title: 'Código',
			width: 200,
		},
		{
			accessor: 'name',
			render: item => <LineBadge color={item.color} shortName={item.name} size="full-width" textColor={item.text_color} />,
			title: 'Nome',
			width: 300,
		},
		{
			accessor: 'agency_ids',
			render: item => <TypologiesListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Typology) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (typologiesList.flags.loading) {
		return <LoadingOverlay />;
	}

	if (typologiesList.flags.error) {
		return <ErrorDisplay message={typologiesList.flags.error.message} />;
	}

	return (
		<Pane header={[
			<TypologiesListHeader key="header" />,
			<TypologiesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={typologiesList.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
