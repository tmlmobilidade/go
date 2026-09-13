'use client';

import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { DataTable, type DataTableColumn, DataTableScroller, ErrorDisplay, IdTag, Label, Pane, ProcessingStatusDisplay, UnixMillisecondsDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { ExtractionsListActionDelete } from '../ExtractionsListActionDelete';
import { ExtractionsListActionLock } from '../ExtractionsListActionLock';
import { ExtractionsListFooter } from '../ExtractionsListFooter';
import { ExtractionsListHeader } from '../ExtractionsListHeader';
import { ExtractionsListFilterBar } from '../filters/ExtractionsListFilterBar';
import { useExtractionsListData } from '../use-extractions-list-data';

/* * */

export function ExtractionsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, error, isLoading } = useExtractionsListData();

	const columns: DataTableColumn<Extraction>[] = [
		{
			accessor: 'lock',
			render: item => <ExtractionsListActionLock extractionItem={item} />,
			title: null,
			width: 60,
		},
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('shared:extractions.components.ExtractionsList.table.columns._id.title'),
			width: 80,
		},
		{
			accessor: 'processing_status',
			render: item => <ProcessingStatusDisplay value={item.processing_status} />,
			title: t('shared:extractions.components.ExtractionsList.table.columns.processing_status.title'),
			width: 125,
		},
		{
			accessor: 'created_at',
			render: item => <UnixMillisecondsDisplay value={item.created_at} showDate showTime />,
			title: t('shared:extractions.components.ExtractionsList.table.columns.created_at.title'),
			width: 180,
		},
		{
			accessor: 'version',
			render: item => <Label>{t(`shared:extractions.versions.${item.version}.title`)}</Label>,
			title: t('shared:extractions.components.ExtractionsList.table.columns.version.title'),
			width: 'fill',
		},
		{
			accessor: 'remove',
			render: item => <ExtractionsListActionDelete extractionItem={item} />,
			title: null,
			width: 70,
		},
	];

	//
	// B. Render components

	return (
		<Pane
			footer={[<ExtractionsListFooter key="footer" />]}
			header={[
				<ExtractionsListHeader key="header" />,
				<ExtractionsListFilterBar key="filter-bar" />,
			]}
		>
			<div style={{ minHeight: '50vh' }}>
				{error && <ErrorDisplay message={error} />}
				<DataTableScroller>
					<DataTable
						columns={columns}
						isLoading={isLoading}
						// onRowClick={handleRowClick}
						records={data}
						rowIdAccessor="_id"
					/>
				</DataTableScroller>
			</div>
		</Pane>
	);
}
