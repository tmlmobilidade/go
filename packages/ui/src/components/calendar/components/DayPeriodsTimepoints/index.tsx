'use client';

import { IconMoon, IconSun, IconSunset } from '@tabler/icons-react';
import { type DayPeriod, type HHMM } from '@tmlmobilidade/go-types-offer';
import { getDayPeriodLabels, groupTimesByDayPeriod } from '@tmlmobilidade/go-utils-offer';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Text } from '../../../display';
import { Section } from '../../../layout';
import { TimeChip } from '../TimeChip';

/* * */

interface DayPeriodType {
	icon: JSX.Element
	key: DayPeriod
}

const DAY_PERIODS: DayPeriodType[] = [
	{ icon: <IconSun size={14} />, key: 'morning_peak' },
	{ icon: <IconSun className={styles.mutedIcon} size={14} />, key: 'daytime' },
	{ icon: <IconSunset className={styles.mutedIcon} size={14} />, key: 'afternoon_peak' },
	{ icon: <IconMoon size={14} />, key: 'night' },
	{ icon: <IconMoon className={styles.mutedIcon} size={14} />, key: 'early_morning' },
];

/* * */

interface DayPeriodsTimepointsProps {
	children?: (time: string) => React.ReactNode
	onRemove?: (time: string) => void
	timepoints?: HHMM[]
	variant?: 'compact' | 'long'
}

/* * */

export function DayPeriodsTimepoints({ children, onRemove, timepoints = [], variant = 'compact' }: DayPeriodsTimepointsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const groupedTimePoints = groupTimesByDayPeriod(timepoints);
	const labels = getDayPeriodLabels(t);

	const getDayPeriodTitle = (period: DayPeriod) => labels[period].long_with_time;

	//
	// B. Render components

	if (variant === 'long') {
		return (
			<Section gap="md" padding="none">
				{DAY_PERIODS.map(period => (
					<Section key={period.key} alignItems="flex-start" gap="sm" padding="none">
						<Text c="var(--color-system-text-200)" className={styles.longTitle} size="xs">
							{period.icon} {getDayPeriodTitle(period.key)}
						</Text>
						<Section flexDirection="row" flexWrap="wrap" gap="xs" padding="none">
							{groupedTimePoints[period.key].length === 0 && (
								<Text c="var(--color-system-text-300)" size="xs">
									{t('shared:components.calendar.noTimepoints')}
								</Text>
							)}
							{groupedTimePoints[period.key].map(time => (
								<React.Fragment key={time}>
									{children ? children(time) : <TimeChip key={time} onRemove={onRemove ? () => onRemove?.(time) : undefined} time={time} />}
								</React.Fragment>
							))}
						</Section>
					</Section>
				))}
			</Section>
		);
	}

	return (
		<Section gap="xs" padding="none">
			{DAY_PERIODS.filter(p => groupedTimePoints[p.key].length > 0).map(period => (
				<Section key={period.key} alignItems="flex-start" flexDirection="row" gap="xs" padding="none">
					<Text className={styles.compactTitle} size="xs">
						{period.icon} {labels[period.key].short}
					</Text>
					<Section flexDirection="row" flexWrap="wrap" gap="xs" padding="none">
						{groupedTimePoints[period.key].map(time => (
							<React.Fragment key={time}>
								{children ? children(time) : <TimeChip key={time} onRemove={onRemove ? () => onRemove?.(time) : undefined} time={time} />}
							</React.Fragment>
						))}
					</Section>
				</Section>
			))}
		</Section>
	);

	//
}
