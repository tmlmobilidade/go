'use client';

import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

interface AlertDetailViewHeaderProps {
	title: string
}

/* * */

export function AlertDetailViewHeader({ title }: AlertDetailViewHeaderProps) {
	//

	//
	// B. Render componentss

	return (
		<Surface variant="plain">
			<Section gap="sm">
				<h1 className={styles.alertTitle}>
					{title}
				</h1>
			</Section>
		</Surface>
	);
}
