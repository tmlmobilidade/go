'use client';

/* * */

import { IconMoon, IconSun, IconSunset } from '@tabler/icons-react';
import { BusinessPeriod } from '@tmlmobilidade/types';
import React, { JSX } from 'react';

import styles from './styles.module.css';

import { Text } from '../../../display';
import { Section } from '../../../layout';
import { groupTimesByPeriod } from '../../utils/businessPeriods';
import { TimeChip } from '../TimeChip';

/* * */

interface BusinessPeriodType {
	icon: JSX.Element
	key: BusinessPeriod
	title: string
}

const BUSINESS_PERIODS: BusinessPeriodType[] = [
	{ icon: <IconSun size={14} />, key: 'ppm', title: 'PPM — Período de ponta da manhã (06:00 - 09:59)' },
	{ icon: <IconSun size={14} style={{ opacity: 0.7 }} />, key: 'cd', title: 'CD — Corpo do Dia (10:00 - 15:59)' },
	{ icon: <IconSunset size={14} style={{ opacity: 0.7 }} />, key: 'ppt', title: 'PPT — Período de ponta da tarde (16:00 - 19:59)' },
	{ icon: <IconMoon size={14} />, key: 'n', title: 'N — Noite (20:00 - 23:59)' },
	{ icon: <IconMoon size={14} style={{ opacity: 0.7 }} />, key: 'm', title: 'M — Madrugada (00:00 - 05:59)' },
];

/* * */

interface BusinessPeriodsTimepointsProps {
	children?: (time: string) => React.ReactNode
	onRemove?: (time: string) => void
	timepoints?: string[] // "HH:mm"
	variant?: 'compact' | 'long'
}

/* * */

export function BusinessPeriodsTimepoints({ children, onRemove, timepoints = [], variant = 'compact' }: BusinessPeriodsTimepointsProps) {
	//

	//
	// A. Setup variables

	const groupedTimePoints = groupTimesByPeriod(timepoints);

	//
	// B. Render components

	if (variant === 'long') {
		return (
			<Section gap="md" padding="none">
				{BUSINESS_PERIODS.map(period => (
					<Section key={period.key} gap="sm" padding="none">
						<Text c="var(--color-system-text-200)" className={styles.longTitle} size="xs">
							{period.icon} {period.title}
						</Text>
						<Section flexDirection="row" flexWrap="wrap" gap="sm" padding="none">
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
			{BUSINESS_PERIODS.filter(p => groupedTimePoints[p.key].length > 0).map(period => (
				<Section key={period.key} alignItems="center" flexDirection="row" gap="xs" padding="none">
					<Text className={styles.compactTitle} size="xs">
						{period.icon} {period.key.toUpperCase()}
					</Text>
					<Section flexDirection="row" flexWrap="wrap" gap="sm" padding="none">
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
