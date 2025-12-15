'use client';

/* * */

import { AnnotationsListCellAgencies } from '@/components/annotations/list/AnnotationsListCellAgencies';
import { AnnotationsListCellDates } from '@/components/annotations/list/AnnotationsListCellDates';
import { AnnotationsListHeader } from '@/components/annotations/list/AnnotationsListHeader';
import { useAnnotationsListContext } from '@/contexts/AnnotationsList.context';
import { type AnnotationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag, Text } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { AnnotationsListFiltersBar } from '../AnnotationsListFiltersBar';

/* * */

export function AnnotationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const annotationsListContext = useAnnotationsListContext();

	const columns: DataTableColumn<AnnotationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'title',
			render: item => <Text>{item.title}</Text>,
			title: 'Título',
			width: 200,
		},
		{
			accessor: 'agency_ids_normalized',
			render: item => <AnnotationsListCellAgencies agencyIds={item.agency_ids} />,
			title: 'Operadores',
			width: 300,
		},
		{
			accessor: 'dates',
			render: item => <AnnotationsListCellDates dates={item.dates} />,
			title: 'Datas',
			width: 310,
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
			<AnnotationsListHeader />,
			<AnnotationsListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={annotationsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
