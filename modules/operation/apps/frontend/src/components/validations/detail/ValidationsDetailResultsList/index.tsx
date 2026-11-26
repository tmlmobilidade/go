'use client';

import { DataTable, type DataTableColumn, DataTableScroller, Pane, SeverityTag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type ValidationsDetailResultItem } from '../use-validations-detail-results';
import { useValidationsDetailResultsContext } from '../ValidationsDetailResults.context';
import { ValidationsDetailResultsListHeader } from '../ValidationsDetailResultsListHeader';

/* * */

export function ValidationsDetailResultsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data } = useValidationsDetailResultsContext();

	const columns: DataTableColumn<ValidationsDetailResultItem>[] = [
		{
			accessor: 'severity',
			render: item => <SeverityTag severity={item.result.severity} />,
			title: t('gtfs_validations:detail.ValidationsDetailResultsList.columns.severity'),
			width: 90,
		},
		{
			accessor: 'description',
			render: item => (
				<span className={styles.descriptionWrapper}>
					<code className={styles.ruleId}>{item.id}</code>
					<span className={styles.description}>{item.result.description}</span>
				</span>
			),
			title: t('gtfs_validations:detail.ValidationsDetailResultsList.columns.description'),
			width: 700,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: ValidationsDetailResultItem) => {
		actions.select(item.id);
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<ValidationsDetailResultsListHeader key="filters" />,
		]}
		>
			<DataTableScroller>
				<DataTable
					columns={columns}
					onRowClick={handleRowClick}
					records={data.results}
					rowIdAccessor="id"
					selectedId={data.selected?.id}
				/>
			</DataTableScroller>
		</Pane>
	);
}
