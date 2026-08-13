'use client';

import styles from './styles.module.css';

import { CopyButton } from '../../../buttons';
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
	return (
		<CopyButton value={String(count)}>
			{({ copied, copy }) => (
				<Tooltip label={copied ? 'Número de dias copiado' : 'Copiar número de dias'} position="bottom" withArrow>
					<button
						aria-label={copied ? 'Número de dias copiado' : 'Copiar número de dias afetados'}
						className={`${styles.root} ${className ?? ''}`}
						data-layout={layout}
						onClick={copy}
						type="button"
					>
						<Surface align="center" className={styles.surface} justify="center" variant="primary" withBackground>
							<Text c="var(--color-primary)" size={layout === 'inline' ? 'lg' : 'xl'} weight="bold">{count}</Text>
							<Text size="sm" weight="extra-bold">{count === 1 ? 'dia afetado' : 'dias afetados'}</Text>
						</Surface>
					</button>
				</Tooltip>
			)}
		</CopyButton>
	);
}
