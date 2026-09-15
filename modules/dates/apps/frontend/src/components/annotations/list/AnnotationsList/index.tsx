'use client';

import { AnnotationsListHeader } from '@/components/annotations/list/AnnotationsListHeader';
import { AnnotationsListFiltersBar } from '@/components/annotations/list/filters/AnnotationsListFiltersBar';
import { AnnotationsListCellAgencies } from '@/components/annotations/list/table/AnnotationsListCellAgencies';
import { AnnotationsListCellDates } from '@/components/annotations/list/table/AnnotationsListCellDates';
import { type AnnotationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useAnnotationsDetailAnnotationId } from '../../detail/use-annotations-detail-annotation-id';
import { useAnnotationsListData } from '../use-annotations-list-data';

/* * */

export function AnnotationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { annotationId } = useAnnotationsDetailAnnotationId();

	const annotationsData = useAnnotationsListData();

	const columns: DataTableColumn<AnnotationNormalized>[] = [
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
			render: item => <AnnotationsListCellAgencies value={item.agency_ids} />,
			title: 'Operadores',
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <AnnotationsListCellDates value={item.dates} />,
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

	return (
		<Pane header={[<AnnotationsListHeader key="header" />, <AnnotationsListFiltersBar key="filters" />]}>
			{annotationsData.error && <ErrorDisplay message={annotationsData.error} />}
			<DataTable
				columns={columns}
				isLoading={annotationsData.isLoading}
				onRowClick={handleRowClick}
				records={annotationsData.data}
				rowIdAccessor="_id"
				selectedId={annotationId}
			/>
		</Pane>
	);
}
