'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type NetworkLine } from '@/types/network-line';
import { DataTableV2 } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createLinePerformanceColumns } from './columns';

/* * */

interface LinePerformanceTableProps {
	getFilterHref: (pathname: string) => string
	isLoading: boolean
	lines: NetworkLine[]
	paginationResetKey: string
}

/* * */

const NETWORK_LINES_PAGE_SIZE = 10;

/* * */

export function LinePerformanceTable({ getFilterHref, isLoading, lines, paginationResetKey }: LinePerformanceTableProps) {
	//

	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const columns = useMemo(() => createLinePerformanceColumns(t, getFilterHref, formatters), [formatters, getFilterHref, t]);

	//
	// B. Render components

	return (
		<DataTableV2
			ariaLabel={t('networkLines.table.title')}
			className={styles.table}
			columns={columns}
			emptyState={t('networkLines.empty')}
			getRowId={line => line._id}
			isLoading={isLoading}
			records={lines}
			rowClassName={line => line.needsAttention ? styles.attentionRow : undefined}
			pagination={{
				defaultPageSize: NETWORK_LINES_PAGE_SIZE,
				pageSizeLabel: t('networkLines.table.rowsPerPage'),
				pageSizeOptions: [10, 25, 50, 100],
				rangeLabel: range => t('networkLines.table.visibleRange', { end: range.end, start: range.start, total: range.total }),
				resetKey: paginationResetKey,
			}}
		/>
	);

	//
}
