/* * */

import { Skeleton } from '@mantine/core';

import styles from './styles.module.css';

import { Section, Surface, type SurfaceProps } from '../../layout';

/* * */

interface ValueDisplayProps {
	elevated?: SurfaceProps['elevated']
	footer?: React.ReactNode
	icon?: React.ReactNode
	isLoading?: boolean
	label: string
	strong?: boolean
	value: React.ReactNode | string
	variant?: SurfaceProps['variant']
}

/* * */

export function ValueDisplay({ elevated, footer, icon, isLoading, label, strong, value, variant = 'bordered' }: ValueDisplayProps) {
	return (
		<Surface elevated={elevated} variant={variant}>
			<Section gap="xs">
				<p className={styles.label}>{label} {icon}</p>
				{isLoading
					? <Skeleton height={12} width={230} />
					: <p className={styles.value} data-strong={strong}>{value}</p>}
				{footer && <p className={styles.footer}>{footer}</p>}
			</Section>
		</Surface>
	);
}
