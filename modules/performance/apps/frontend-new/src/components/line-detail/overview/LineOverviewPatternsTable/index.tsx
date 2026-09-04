'use client';

/* * */

import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { DataTableV2, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createLineOverviewPatternColumns } from './columns';
import { useLineOverviewPatternsTableData } from './useLineOverviewPatternsTableData';

/* * */

export function LineOverviewPatternsTable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const patternsTable = useLineOverviewPatternsTableData();
	const { exportRows, line, patterns, rows } = patternsTable.data;
	const columns = useMemo(() => createLineOverviewPatternColumns(t), [t]);

	//
	// B. Render components

	return (
		<Surface className={styles.root} height="full">
			<header className={styles.header}>
				<div>
					<h2>{t('lineDetail.patternsTable.title')}</h2>
					<p>{t('lineDetail.patternsTable.description')}</p>
				</div>
				<div className={styles.headerActions}>
					<span>{t(patternsTable.flags.has_demand_error || patternsTable.flags.has_operational_error ? 'lineDetail.patternsTable.identityOnly' : 'lineDetail.patternsTable.mixedData')}</span>
					<PerformanceCsvExportButton
						datasets={[{ rows: exportRows }]}
						disabled={patternsTable.flags.is_loading || !rows.length}
						filenameParts={[line?.code]}
						metadata={{ line_code: line?.code, line_id: line?._id }}
						visualizationId="patterns"
					/>
				</div>
			</header>

			<DataTableV2
				ariaLabel={t('lineDetail.patternsTable.ariaLabel')}
				className={styles.table}
				columns={columns}
				emptyState={t('lineDetail.patternsTable.empty')}
				getRowId={pattern => pattern.id}
				isLoading={patternsTable.flags.is_loading}
				loadingRows={Math.max(patterns.length, 2)}
				records={rows}
			/>
		</Surface>
	);

	//
}
