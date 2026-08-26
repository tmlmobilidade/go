/* * */

import { Section, Surface } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface DashboardCardProps {
	action?: ReactNode
	children: ReactNode
	className?: string
	description?: ReactNode
	title: ReactNode
}

/* * */

export function DashboardCard({ action, children, className, description, title }: DashboardCardProps) {
	const rootClassName = className ? `${styles.root} ${className}` : styles.root;

	return (
		<Surface className={rootClassName} height="full" overflow="visible">
			<Section className={styles.content} gap="md" height="100%" padding="md">
				<header className={styles.header}>
					<div className={styles.heading}>
						<h2>{title}</h2>
						{description && <p>{description}</p>}
					</div>
					{action && <div className={styles.action}>{action}</div>}
				</header>
				<div className={styles.body}>{children}</div>
			</Section>
		</Surface>
	);
}
