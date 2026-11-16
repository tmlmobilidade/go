'use client';

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { CopyButton } from '../../../../buttons';
import { Tooltip } from '../../../common';
import { Text } from '../../../display';
import { Surface } from '../../../layout';

/* * */

export interface CalendarAffectedDaysCountProps {
	className?: string
	count: number
	layout?: 'inline' | 'stacked'
}

/* * */

export function CalendarAffectedDaysCount({ className, count, layout = 'stacked' }: CalendarAffectedDaysCountProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<CopyButton value={String(count)}>
			{({ copied, copy }) => (
				<Tooltip label={t(copied ? 'shared:components.calendar.daysCopied' : 'shared:components.calendar.copyDays')} position="bottom" withArrow>
					<button
						aria-label={t(copied ? 'shared:components.calendar.daysCopied' : 'shared:components.calendar.copyAffectedDays')}
						className={`${styles.root} ${className ?? ''}`}
						data-layout={layout}
						onClick={copy}
						type="button"
					>
						<Surface align="center" className={styles.surface} justify="center" variant="primary" withBackground>
							<Text c="var(--color-primary)" size={layout === 'inline' ? 'lg' : 'xl'} weight="bold">{count}</Text>
							<Text size="sm" weight="extra-bold">{t('shared:components.calendar.affectedDays', '', { count })}</Text>
						</Surface>
					</button>
				</Tooltip>
			)}
		</CopyButton>
	);
}
