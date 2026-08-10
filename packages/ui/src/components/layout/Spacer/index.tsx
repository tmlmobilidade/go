/* * */

import styles from './styles.module.css';

/* * */

interface SpacerProps {
	orientation?: 'horizontal' | 'vertical'
	shrink?: boolean
	size?: 'full' | 'lg' | 'md' | 'sm' | 'xs'
}

/* * */

export function Spacer({ orientation = 'horizontal', shrink = false, size = 'full' }: SpacerProps) {
	return (
		<div
			className={styles.container}
			data-orientation={orientation}
			data-shrink={shrink}
			data-size={size}
		/>
	);
}
