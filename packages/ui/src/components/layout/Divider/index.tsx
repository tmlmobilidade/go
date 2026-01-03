/* * */

import styles from './styles.module.css';

/* * */

interface DividerProps {
	lineStyle?: 'dashed' | 'solid'
	orientation?: 'horizontal' | 'vertical'
}

/* * */

export function Divider({ lineStyle = 'solid', orientation = 'horizontal' }: DividerProps) {
	return <div className={styles.container} data-line-style={lineStyle} data-orientation={orientation} />;
}
