/* * */

import { type SeverityStatus } from '@tmlmobilidade/go-types-shared';
import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface SeverityTagProps {
	dimmed?: boolean
	label?: string
	onClick?: () => void
	selected?: boolean
	severity: SeverityStatus
}

const SEVERITY_CONFIG = {
	error: { ariaLabel: 'Filtrar por erros', defaultLabel: 'Erro', variant: 'danger' },
	forbidden: { ariaLabel: 'Filtrar por proibidos', defaultLabel: 'Proibido', variant: 'danger' },
	info: { ariaLabel: 'Filtrar por informações', defaultLabel: 'Informação', variant: 'secondary' },
	warning: { ariaLabel: 'Filtrar por avisos', defaultLabel: 'Aviso', variant: 'warning' },
} as const satisfies Record<Exclude<SeverityStatus, 'ignore'>, { ariaLabel: string, defaultLabel: string, variant: 'danger' | 'secondary' | 'warning' }>;

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
