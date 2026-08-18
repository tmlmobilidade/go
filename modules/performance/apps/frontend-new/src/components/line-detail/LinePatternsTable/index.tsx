'use client';

/* * */

import { getPatternMetricValueByCode } from '@/utils/pattern-metrics';
import { type PerformanceNetworkPattern } from '@tmlmobilidade/go-types-performance';
import { DataTableV2 } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createLinePatternColumns } from './columns';
import { type LinePatternTableRow } from './types';

/* * */

interface LinePatternsTableProps {
	demandByPatternCode: Map<string, number>
	hasDemandError: boolean
	isLoading: boolean
	patterns: PerformanceNetworkPattern[]
}

/* * */

const SIMULATED_SERVICE = [96.4, 94.8, 92.6, 97.1];
const SIMULATED_DELAYS = [4.2, 6.8, 9.4, 3.9];
const SIMULATED_ADVANCES = [1.1, 2.4, 1.6, 0.8];

/* * */

export function LinePatternsTable({ demandByPatternCode, hasDemandError, isLoading, patterns }: LinePatternsTableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const columns = useMemo(() => createLinePatternColumns(t), [t]);

	//
	// B. Transform data

	const rows = useMemo<LinePatternTableRow[]>(() => patterns.map((pattern, index) => ({
		advances: SIMULATED_ADVANCES[index % SIMULATED_ADVANCES.length],
		code: pattern.code,
		delays: SIMULATED_DELAYS[index % SIMULATED_DELAYS.length],
		id: pattern._id,
		label: pattern.headsign || `${pattern.origin} → ${pattern.destination}`,
		service: SIMULATED_SERVICE[index % SIMULATED_SERVICE.length],
		validations: getPatternMetricValueByCode(demandByPatternCode, pattern),
	})), [demandByPatternCode, patterns]);

	//
	// C. Render components

	return (
		<section className={styles.root}>
			<header className={styles.header}>
				<div>
					<h2>{t('lineDetail.patternsTable.title')}</h2>
					<p>{t('lineDetail.patternsTable.description')}</p>
				</div>
				<span>{t(hasDemandError ? 'lineDetail.patternsTable.identityOnly' : 'lineDetail.patternsTable.mixedData')}</span>
			</header>

			<DataTableV2
				ariaLabel={t('lineDetail.patternsTable.ariaLabel')}
				className={styles.table}
				columns={columns}
				emptyState={t('lineDetail.patternsTable.empty')}
				getRowId={pattern => pattern.id}
				isLoading={isLoading}
				loadingRows={Math.max(patterns.length, 2)}
				records={rows}
			/>
		</section>
	);

	//
}
