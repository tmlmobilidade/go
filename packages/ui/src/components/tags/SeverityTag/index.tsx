'use client';

/* * */

import { type SeverityStatus } from '@tmlmobilidade/go-types-shared';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Tag } from '../Tag';

/* * */

export interface SeverityTagProps {
	dimmed?: boolean
	label?: string
	onClick?: () => void
	selected?: boolean
	severity: SeverityStatus
}

const SEVERITY_CONFIG = {
	error: { variant: 'danger' },
	forbidden: { variant: 'danger' },
	info: { variant: 'secondary' },
	warning: { variant: 'warning' },
} as const satisfies Record<Exclude<SeverityStatus, 'ignore'>, { variant: 'danger' | 'secondary' | 'warning' }>;

/* * */

export function SeverityTag({ dimmed, label, onClick, selected, severity }: SeverityTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	if (severity === 'ignore') return null;

	const config = SEVERITY_CONFIG[severity];
	const tag = <Tag label={label ?? t(`shared:components.tags.SeverityTag.${severity}.label`)} variant={config.variant} filled />;

	if (!onClick) return tag;

	//
	// C. Render components

	return (
		<button
			aria-label={t(`shared:components.tags.SeverityTag.${severity}.filter`)}
			aria-pressed={selected}
			className={styles.clickable}
			onClick={onClick}
			type="button"
		>
			<span className={dimmed ? styles.dimmed : undefined}>{tag}</span>
		</button>
	);

	//
}
