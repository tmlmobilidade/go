/* * */

import { forwardRef } from 'react';

import styles from './styles.module.css';

/* * */

interface IndicatorProps {
	color?: string
	filled?: boolean
	size?: 'lg' | 'md' | 'sm'
	variant?: 'danger' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

export const Indicator = forwardRef<HTMLDivElement, IndicatorProps>(
	({ color, filled = false, size, variant = 'primary' }, ref) => {
		return (
			<div ref={ref} className={styles.root} data-filled={filled} data-size={size} data-variant={variant}>
				<div
					className={styles.indicator}
					style={color ? {
						backgroundColor: filled ? color : 'transparent',
						borderColor: color,
					} : undefined}
				/>
			</div>
		);
	},
);

Indicator.displayName = 'Indicator';
