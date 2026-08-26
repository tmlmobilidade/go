/* * */

import { Section, Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function LineDetailLoadingState() {
	return (
		<Section className={styles.root} gap="md" padding="md">
			<Skeleton className={styles.header} />
			<Skeleton className={styles.content} />
		</Section>
	);
}
