'use client';

import { IconMoon, IconSun, IconSunset } from '@tabler/icons-react';
import { groupTimesByDayPeriod } from '@tmlmobilidade/dates';
import { DAY_PERIOD_LABELS, DayPeriod, HHMM } from '@tmlmobilidade/types';
import React, { JSX } from 'react';

import styles from './styles.module.css';

import { Text } from '../../../display';
import { Section } from '../../../layout';
import { TimeChip } from '../TimeChip';

/* * */

interface DayPeriodType {
	icon: JSX.Element
	key: DayPeriod
	title: string
}

const DAY_PERIODS: DayPeriodType[] = [
	{ icon: <IconSun size={14} />, key: 'PPM', title: DAY_PERIOD_LABELS.PPM.long_with_time },
	{ icon: <IconSun size={14} style={{ opacity: 0.7 }} />, key: 'CD', title: DAY_PERIOD_LABELS.CD.long_with_time },
	{ icon: <IconSunset size={14} style={{ opacity: 0.7 }} />, key: 'PPT', title: DAY_PERIOD_LABELS.PPT.long_with_time },
	{ icon: <IconMoon size={14} />, key: 'N', title: DAY_PERIOD_LABELS.N.long_with_time },
	{ icon: <IconMoon size={14} style={{ opacity: 0.7 }} />, key: 'M', title: DAY_PERIOD_LABELS.M.long_with_time },
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

	const groupedTimePoints = groupTimesByDayPeriod(timepoints);

	//
	// B. Render components

	if (variant === 'long') {
		return (
			<Section gap="md" padding="none">
				{DAY_PERIODS.map(period => (
					<Section key={period.key} alignItems="flex-start" gap="sm" padding="none">
						<Text c="var(--color-system-text-200)" className={styles.longTitle} size="xs">
							{period.icon} {period.title}
						</Text>
						<Section flexDirection="row" flexWrap="wrap" gap="xs" padding="none">
							{groupedTimePoints[period.key].length === 0 && (
								<Text c="var(--color-system-text-300)" size="xs">
									Sem horários
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
						{period.icon} {period.key}
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
