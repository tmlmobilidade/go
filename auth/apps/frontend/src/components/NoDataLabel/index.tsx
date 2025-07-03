/* * */

import styles from './styles.module.css';

/* * */

export interface NoDataLabelProps {
	text?: string
}

/* * */

export function NoDataLabel({ text = '' }: NoDataLabelProps) {
	return (
		<p className={styles.label}>
			{text}
		</p>
	);
}
