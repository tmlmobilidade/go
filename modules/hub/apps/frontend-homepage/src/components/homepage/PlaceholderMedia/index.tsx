/* * */

import { type Icon } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface PlaceholderMediaProps {
	caption: string
	icon: Icon
}

/* * */

export function PlaceholderMedia({ caption, icon: Icon }: PlaceholderMediaProps) {
	return (
		<div aria-label={caption} className={styles.container} role="img">
			<div className={styles.frame}>
				<span className={styles.icon}>
					<Icon size={32} stroke={1.6} />
				</span>
				<span className={styles.label}>Pré-visualização em breve</span>
			</div>
		</div>
	);
}
