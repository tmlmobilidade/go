/* * */

import { type ReactNode } from 'react';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';
import { Section, Surface, type SurfaceProps } from '../../layout';

/* * */

interface ValueDisplayProps {
	className?: string
	elevated?: SurfaceProps['elevated']
	icon?: ReactNode
	label: string
	onClick?: () => void
	strong?: boolean
	value: ReactNode | string
	variant?: SurfaceProps['variant']
}

/* * */

export function ValueDisplay({ className, elevated, icon, label, onClick, strong, value, variant = 'bordered' }: ValueDisplayProps) {
	return (
		<Surface elevated={elevated} variant={variant}>
			<Section>
				<p className={cn(styles.label, className)} onClick={onClick}>{label} {icon}</p>
				<p className={styles.value} data-strong={strong}>{value}</p>
			</Section>
		</Surface>
	);
}
