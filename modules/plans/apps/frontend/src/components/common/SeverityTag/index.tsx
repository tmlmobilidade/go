/* * */

import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

type Severity = 'error' | 'forbidden' | 'ignore' | 'warning';

interface SeverityTagProps {
	dimmed?: boolean
	label?: string
	onClick?: () => void
	selected?: boolean
	severity: Severity
}

const SEVERITY_CONFIG = {
	error: { ariaLabel: 'Filtrar por erros', defaultLabel: 'Erro', variant: 'danger' },
	forbidden: { ariaLabel: 'Filtrar por proibidos', defaultLabel: 'Proibido', variant: 'danger' },
	warning: { ariaLabel: 'Filtrar por avisos', defaultLabel: 'Aviso', variant: 'warning' },
} as const satisfies Record<Exclude<Severity, 'ignore'>, { ariaLabel: string, defaultLabel: string, variant: 'danger' | 'warning' }>;

/* * */

export function SeverityTag({ dimmed, label, onClick, selected, severity }: SeverityTagProps) {
	//

	if (severity === 'ignore') return null;

	const config = SEVERITY_CONFIG[severity];
	const tag = <Tag label={label ?? config.defaultLabel} variant={config.variant} filled />;

	if (!onClick) return tag;

	return (
		<button
			aria-label={config.ariaLabel}
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
