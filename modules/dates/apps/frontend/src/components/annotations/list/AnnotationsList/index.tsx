'use client';

/* * */

import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { AnnotationsListCellAgencies } from '@/components/annotations/list/AnnotationsListCellAgencies';
import { AnnotationsListCellDates } from '@/components/annotations/list/AnnotationsListCellDates';
import { AnnotationsListFiltersBar } from '@/components/annotations/list/AnnotationsListFiltersBar';
import { AnnotationsListHeader } from '@/components/annotations/list/AnnotationsListHeader';
import { type AnnotationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function AnnotationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const annotationsListContext = useAnnotationsListContext();

	const columns: DataTableColumn<AnnotationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="id" />,
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
			render: item => <AnnotationsListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <AnnotationsListCellDates dates={item.dates} />,
			title: 'Datas',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: AnnotationNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (annotationsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (annotationsListContext.flags.error) {
		return <ErrorDisplay message={annotationsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<AnnotationsListHeader key="header" />,
			<AnnotationsListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={annotationsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
