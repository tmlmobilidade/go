/* * */

import styles from './styles.module.css';

/* * */

interface LabelValueCardProps {
	label: string
	raised?: boolean
	value: string
}

/* * */

export function LabelValueCard({ label, raised, value }: LabelValueCardProps) {
	return (
		<div className={styles.container} data-raised={raised}>
			<p className={styles.label}>{label}</p>
			<p className={styles.value}>{value}</p>
		</div>
	);
}
