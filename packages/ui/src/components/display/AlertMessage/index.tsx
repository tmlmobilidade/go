/* * */

import { IconAlertCircle } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface AlertMessageProps {
	icon?: React.ReactNode
	raised?: boolean
	title: string
	variant?: 'danger' | 'muted' | 'primary' | 'secondary'
}

/* * */

export function AlertMessage({ icon, raised, title, variant = 'primary' }: AlertMessageProps) {
	return (
		<div className={styles.root} data-raised={raised} data-variant={variant}>
			{icon ?? <IconAlertCircle />}
			<p className={styles.title}>{title}</p>
		</div>
	);
}
