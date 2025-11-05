/* * */

import { IconAlertCircle } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface AlertCardProps {
	icon?: React.ReactNode
	message?: string
	title?: string
	variant?: 'danger' | 'disabled' | 'muted' | 'primary' | 'secondary'
}

/* * */

export function AlertCard({ icon, message, title }: AlertCardProps) {
	return (
		<div className={styles.container}>
			<div className={styles.outterWrapper}>
				<div>{icon ?? <IconAlertCircle />}</div>
				<div className={styles.innerWrapper}>
					<p className={styles.title}>{title ?? 'Atenção'}</p>
					{message && <p className={styles.message}>{message}</p>}
				</div>
			</div>
		</div>
	);
}
