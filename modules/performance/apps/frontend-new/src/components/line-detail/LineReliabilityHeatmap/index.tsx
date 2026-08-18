'use client';

/* * */

import { Heatmap, type HeatmapLegendItem, Select } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { createLineHeatmapCells, getLineHeatmapTone, HEATMAP_DAY_IDS, HEATMAP_HOURS, type LineHeatmapMetric } from './metrics';

/* * */

const SEMANTIC_TONES = ['positive', 'low', 'medium', 'high', 'critical'] as const;
const INTENSITY_TONES = ['intensity-1', 'intensity-2', 'intensity-3', 'intensity-4', 'intensity-5'] as const;

/* * */

export function LineReliabilityHeatmap() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation('default');
	const [metric, setMetric] = useState<LineHeatmapMetric>('delays');
	const columns = HEATMAP_HOURS.map(hour => ({ id: String(hour), label: String(hour).padStart(2, '0') }));
	const rows = useMemo(() => HEATMAP_DAY_IDS.map(id => ({ id, label: t(`lineDetail.reliabilityHeatmap.days.${id}`) })), [t]);
	const metricOptions = useMemo(() => (['validations', 'service', 'delays', 'advances'] as const).map(value => ({
		label: t(`lineDetail.reliabilityHeatmap.metrics.${value}.label`),
		value,
	})), [t]);

	//
	// B. Transform data

	const cells = useMemo(() => createLineHeatmapCells(metric), [metric]);
	const percentageFormatter = useMemo(
		() => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1, minimumFractionDigits: 1, style: 'percent' }),
		[i18n.language],
	);
	const legendTones = metric === 'validations' ? INTENSITY_TONES : SEMANTIC_TONES;
	const legend = legendTones.map<HeatmapLegendItem>((tone, index) => ({
		label: t(`lineDetail.reliabilityHeatmap.metrics.${metric}.legend.${index + 1}`),
		tone,
	}));
	const metricLabel = t(`lineDetail.reliabilityHeatmap.metrics.${metric}.label`);

	//
	// C. Handle actions

	const handleMetricChange = (value: null | string) => {
		if (!value) return;
		setMetric(value as LineHeatmapMetric);
	};

	//
	// D. Render components

	return (
		<section className={styles.root}>
			<header className={styles.header}>
				<div className={styles.heading}>
					<h2>{t('lineDetail.reliabilityHeatmap.title')}</h2>
					<p>{t(`lineDetail.reliabilityHeatmap.metrics.${metric}.description`)}</p>
				</div>
				<div className={styles.controls}>
					<span className={styles.badge}>{t('lineDetail.reliabilityHeatmap.badge')}</span>
					<Select
						aria-label={t('lineDetail.reliabilityHeatmap.metricLabel')}
						className={styles.metricSelect}
						clearable={false}
						data={metricOptions}
						onChange={handleMetricChange}
						searchable={false}
						value={metric}
					/>
				</div>
			</header>

			<Heatmap
				ariaLabel={t('lineDetail.reliabilityHeatmap.ariaLabel', { metric: metricLabel })}
				cells={cells}
				columns={columns}
				formatValue={value => metric === 'validations' ? Math.round(value).toLocaleString(i18n.language) : percentageFormatter.format(value / 100)}
				getTone={value => getLineHeatmapTone(metric, value)}
				legend={legend}
				rows={rows}
			/>
		</section>
	);

	//
}
