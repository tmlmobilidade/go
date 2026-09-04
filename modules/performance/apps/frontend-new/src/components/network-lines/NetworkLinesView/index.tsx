'use client';

/* * */

import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { LinePerformanceTable } from '@/components/network-lines/LinePerformanceTable';
import { NetworkLinesSummary } from '@/components/network-lines/NetworkLinesSummary';
import { useNetworkLinesData } from '@/hooks/useNetworkLinesData';
import { usePerformanceFilterHref } from '@/hooks/usePerformanceFilterHref';
import { IconSearch } from '@tabler/icons-react';
import { SegmentedControl, TextInput } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type LineListView = 'all' | 'attention';

/* * */

export function NetworkLinesView() {
	//

	// A. Setup variables

	const { t } = useTranslation('default');
	const networkLines = useNetworkLinesData();
	const [query, setQuery] = useState('');
	const [view, setView] = useState<LineListView>('all');
	const getFilterHref = usePerformanceFilterHref();

	//
	// B. Transform data

	const visibleLines = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase('pt-PT');

		return networkLines.data.filter((line) => {
			const matchesView = view === 'all' || line.needsAttention;
			const searchText = `${line.id} ${line.name} ${line.operator}`.toLocaleLowerCase('pt-PT');

			return matchesView && searchText.includes(normalizedQuery);
		});
	}, [networkLines.data, query, view]);
	const exportRows = useMemo(() => networkLines.data.map(line => ({
		advances: line.advances,
		coverage: line.coverage,
		delays: line.delays,
		delays_delta: line.delayDelta,
		line_id: line.id,
		line_name: line.name,
		network_line_id: line._id,
		operator: line.operator,
		service: line.service,
		service_delta: line.serviceDelta,
		validations: line.validations,
		validations_delta: line.validationsDelta,
	})), [networkLines.data]);
	const viewOptions = [
		{ label: t('networkLines.filters.all'), value: 'all' },
		{ label: t('networkLines.filters.attention'), value: 'attention' },
	];

	//
	// C. Handle actions

	const handleQueryChange = (value: string) => {
		setQuery(value);
	};

	const handleViewChange = (value: string) => {
		setView(value as LineListView);
	};

	//
	// D. Render components

	return (
		<div className={styles.root}>
			<nav aria-label={t('networkLines.breadcrumb.ariaLabel')} className={styles.breadcrumb}>
				<Link href={getFilterHref('/network')}>{t('navigation.network.label')}</Link>
				<span>/</span>
				<strong>{t('navigation.network.lines.title')}</strong>
			</nav>

			<header className={styles.header}>
				<div>
					<h1>{t('networkLines.title')}</h1>
					<p>{t('networkLines.subtitle', { count: networkLines.data.length })}</p>
				</div>
				<div className={styles.controls}>
					<TextInput
						aria-label={t('networkLines.filters.search')}
						className={styles.search}
						leftSection={<IconSearch aria-hidden="true" size={18} />}
						onChange={event => handleQueryChange(event.currentTarget.value)}
						placeholder={t('networkLines.filters.search')}
						value={query}
					/>
					<SegmentedControl
						aria-label={t('networkLines.filters.viewAriaLabel')}
						data={viewOptions}
						onChange={handleViewChange}
						value={view}
					/>
				</div>
			</header>

			<NetworkLinesSummary lines={networkLines.data} />

			<section className={styles.tableCard}>
				<header className={styles.tableHeader}>
					<div>
						<h2>{t('networkLines.table.title')}</h2>
					</div>
					<div className={styles.tableHeaderActions}>
						<span>{networkLines.flags.is_demo
							? t('demoData.active')
							: networkLines.flags.is_loading
								? t('networkLines.table.loading')
								: networkLines.flags.has_real_lines && networkLines.flags.has_real_demand && networkLines.flags.has_real_operational
									? t('networkLines.table.mixedData')
									: t('networkLines.table.dataUnavailable')}
						</span>
						<PerformanceCsvExportButton
							datasets={[{ rows: exportRows }]}
							disabled={networkLines.flags.is_loading || !networkLines.data.length}
							scope="network-lines"
							visualizationId="lines"
						/>
					</div>
				</header>

				<LinePerformanceTable getFilterHref={getFilterHref} isLoading={networkLines.flags.is_loading} lines={visibleLines} paginationResetKey={`${query}:${view}`} />
			</section>
		</div>
	);

	//
}
