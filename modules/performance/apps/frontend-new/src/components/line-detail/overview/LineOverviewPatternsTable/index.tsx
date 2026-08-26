'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { getPatternMetricValueByCode } from '@/utils/pattern-metrics';
import { type PerformanceNetworkPattern, type RidePerformanceByPatternItem } from '@tmlmobilidade/go-types-performance';
import { DataTableV2, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createLineOverviewPatternColumns } from './columns';
import { type LineOverviewPatternTableRow } from './types';

/* * */

interface LineOverviewPatternsTableProps {
	demandByPatternCode: Map<string, number>
	hasDemandError: boolean
	hasOperationalError: boolean
	isLoading: boolean
	operationalByPatternCode: Map<string, RidePerformanceByPatternItem>
	patterns: PerformanceNetworkPattern[]
}

/* * */

export function LineOverviewPatternsTable({ demandByPatternCode, hasDemandError, hasOperationalError, isLoading, operationalByPatternCode, patterns }: LineOverviewPatternsTableProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const columns = useMemo(() => createLineOverviewPatternColumns(t, formatters), [formatters, t]);

	//
	// B. Transform data

	const rows = useMemo<LineOverviewPatternTableRow[]>(() => patterns.map(pattern => ({
		advances: operationalByPatternCode.get(pattern.code)?.advances_pct ?? null,
		code: pattern.code,
		delays: operationalByPatternCode.get(pattern.code)?.delays_pct ?? null,
		id: pattern._id,
		label: pattern.headsign || `${pattern.origin} → ${pattern.destination}`,
		service: operationalByPatternCode.get(pattern.code)?.service_pct ?? null,
		validations: getPatternMetricValueByCode(demandByPatternCode, pattern),
	})), [demandByPatternCode, operationalByPatternCode, patterns]);

	//
	// C. Render components

	return (
		<Surface className={styles.root} height="full">
			<header className={styles.header}>
				<div>
					<h2>{t('lineDetail.patternsTable.title')}</h2>
					<p>{t('lineDetail.patternsTable.description')}</p>
				</div>
				<span>{t(hasDemandError || hasOperationalError ? 'lineDetail.patternsTable.identityOnly' : 'lineDetail.patternsTable.mixedData')}</span>
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
		</Surface>
	);

	//
}
