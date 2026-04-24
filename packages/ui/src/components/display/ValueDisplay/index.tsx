/* * */

import { type ReactNode } from 'react';

import styles from './styles.module.css';

import { Section, Surface, type SurfaceProps } from '../../layout';

/* * */

interface ValueDisplayProps {
	elevated?: SurfaceProps['elevated']
	label: string
	strong?: boolean
	value: ReactNode | string
	variant?: SurfaceProps['variant']
}

/* * */

export function ValueDisplay({ elevated, label, strong, value, variant = 'bordered' }: ValueDisplayProps) {
	return (
		<Surface elevated={elevated} variant={variant}>
			<Section>
				<p className={styles.label}>{label}</p>
				<p className={styles.value} data-strong={strong}>{value}</p>
			</Section>
		</Surface>
	);
}
