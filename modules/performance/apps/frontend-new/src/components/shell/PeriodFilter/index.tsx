'use client';

/* * */

import { resolvePerformanceLocale } from '@/hooks/usePerformanceFormatters';
import { operationalDateToUnixTimestamp, unixTimestampToOperationalDate } from '@/utils/operational-dates';
import { formatPeriodRangeLabel } from '@/utils/performance-period-labels';
import { getCurrentPeriod, type PerformancePeriodSelection, type PeriodPreset } from '@/utils/performance-periods';
import { IconCalendar, IconCheck, IconChevronDown } from '@tabler/icons-react';
import { FilterTypeDateRange, Popover } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../FilterMenu/styles.module.css';

/* * */

interface PeriodFilterProps {
	onChange: (selection: PerformancePeriodSelection) => void
	value: PerformancePeriodSelection
}

/* * */

export function PeriodFilter({ onChange, value }: PeriodFilterProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation('default');
	const locale = resolvePerformanceLocale(i18n.language);
	const presetOptions = useMemo(() => [
		{ label: t('filters.period.today'), value: 'today' },
		{ label: t('filters.period.yesterday'), value: 'yesterday' },
		{ label: t('filters.period.last7Days'), value: 'last-7-days' },
		{ label: t('filters.period.monthToDate'), value: 'month-to-date' },
		{ label: t('filters.period.custom'), value: 'custom' },
	], [t]);
	const currentPeriod = getCurrentPeriod(value);
	const valueLabel = formatPeriodRangeLabel(currentPeriod, locale);
	const presetLabel = presetOptions.find(option => option.value === value.preset)?.label ?? value.preset;
	const customStartDate = value.startDate ? operationalDateToUnixTimestamp(value.startDate) : null;
	const customEndDate = value.endDate ? operationalDateToUnixTimestamp(value.endDate) : null;
	type DateRangeValue = NonNullable<Parameters<typeof FilterTypeDateRange>[0]['startDate']>;

	//
	// B. Handle actions

	const handlePresetChange = (preset: PeriodPreset) => {
		if (preset === 'custom') {
			onChange({
				endDate: value.endDate ?? currentPeriod.endDate,
				preset: 'custom',
				startDate: value.startDate ?? currentPeriod.startDate,
			});
			return;
		}

		onChange({ preset });
	};

	//
	// C. Render components

	return (
		<Popover offset={6} position="bottom-start" shadow="md" width={320}>
			<Popover.Target>
				<button aria-label={`${t('filters.period.label')}: ${valueLabel}`} className={styles.trigger} type="button">
					<span className={styles.icon}><IconCalendar size={19} stroke={1.8} /></span>
					<span className={styles.label}>{t('filters.period.label')}</span>
					<strong className={styles.value}>{value.preset === 'custom' ? valueLabel : `${presetLabel} · ${valueLabel}`}</strong>
					<IconChevronDown aria-hidden="true" className={styles.chevron} size={16} />
				</button>
			</Popover.Target>

			<Popover.Dropdown className={styles.dropdown}>
				<div aria-label={t('filters.period.label')} className={styles.options} role="menu">
					{presetOptions.map(option => (
						<button
							key={option.value}
							className={styles.option}
							data-selected={option.value === value.preset}
							onClick={() => handlePresetChange(option.value as PeriodPreset)}
							role="menuitemradio"
							type="button"
						>
							<span><strong>{option.label}</strong></span>
							{option.value === value.preset && <IconCheck aria-hidden="true" size={17} />}
						</button>
					))}
				</div>

				{value.preset === 'custom' && (
					<FilterTypeDateRange
						endDate={customEndDate as DateRangeValue}
						label={t('filters.period.custom')}
						startDate={customStartDate as DateRangeValue}
						onEndDateChange={(endDate) => {
							if (!endDate) return;
							onChange({
								endDate: unixTimestampToOperationalDate(endDate),
								preset: 'custom',
								startDate: value.startDate ?? unixTimestampToOperationalDate(endDate),
							});
						}}
						onStartDateChange={(startDate) => {
							if (!startDate) return;
							onChange({
								endDate: value.endDate ?? unixTimestampToOperationalDate(startDate),
								preset: 'custom',
								startDate: unixTimestampToOperationalDate(startDate),
							});
						}}
						active
					/>
				)}
			</Popover.Dropdown>
		</Popover>
	);

	//
}

/* * */
