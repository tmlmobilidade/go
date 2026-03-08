'use client';

/* * */

import { LineTag } from '@/components/common/LineTag';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { LinesListCellAgency } from '@/components/lines/list/LinesListCellAgency';
import { LinesListFiltersBar } from '@/components/lines/list/LinesListFiltersBar';
import { LinesListHeader } from '@/components/lines/list/LinesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Line } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function LinesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const linesList = useLinesListContext();

	const columns: DataTableColumn<Line>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="id" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'code',
			render: item => <LineTag line_id={item._id} withLabel={false} />,
			title: 'Código',
			width: 100,
		},
		{
			accessor: 'name',
			render: item => <Text>{item.name}</Text>,
			title: 'Nome',
			width: 300,
		},
		{
			accessor: 'agency_id',
			render: item => <LinesListCellAgency agencyId={item.agency_id} />,
			title: 'Operador',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Line) => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (linesList.flags.loading) {
		return <LoadingOverlay />;
	}

	if (linesList.flags.error) {
		return <ErrorDisplay message={linesList.flags.error.message} />;
	}

	return (
		<Pane header={[
			<LinesListHeader key="header" />,
			<LinesListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={linesList.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
