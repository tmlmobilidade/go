/* * */

import styles from './styles.module.css';

/* * */

interface DividerProps {
	orientation?: 'horizontal' | 'vertical'
}

/* * */

export function Divider({ orientation = 'horizontal' }: DividerProps) {
	return <div className={styles.container} data-orientation={orientation} />;
}
