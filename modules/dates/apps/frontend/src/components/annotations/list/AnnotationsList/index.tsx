'use client';

import { AnnotationsListCellAgencies } from '@/components/annotations/list/AnnotationsListCellAgencies';
import { AnnotationsListCellDates } from '@/components/annotations/list/AnnotationsListCellDates';
import { AnnotationsListFiltersBar } from '@/components/annotations/list/AnnotationsListFiltersBar';
import { AnnotationsListHeader } from '@/components/annotations/list/AnnotationsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAnnotationsDetailAnnotationId } from '../../detail/use-annotations-detail-annotation-id';
import { useAnnotationsListData } from '../use-annotations-list-data';

/* * */

export function AnnotationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { annotationId } = useAnnotationsDetailAnnotationId();
	const { t } = useTranslation();

	const { data, error, isLoading } = useAnnotationsListData();

	const columns: DataTableColumn<Annotation>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:annotations.list.columns.id'),
			width: 100,
		},
		{
			accessor: 'title',
			title: t('default:annotations.list.columns.title'),
			width: 400,
		},
		{
			accessor: 'agency_ids',
			render: item => <AnnotationsListCellAgencies agencyIds={item.agency_ids} />,
			title: t('default:annotations.list.columns.agency_ids'),
			width: 200,
		},
		{
			accessor: 'dates',
			render: item => <AnnotationsListCellDates dates={item.dates} />,
			title: t('default:annotations.list.columns.dates'),
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: Annotation) => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(item._id)));
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
			<AnnotationsListHeader key="header" />,
			<AnnotationsListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={annotationId}
			/>
		</Pane>
	);

	//
}
