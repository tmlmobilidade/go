'use client';

import { Text, Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function AnnotationsListCellTitle({ title }: { title: string }) {
	return (
		<Tooltip label={title} multiline withArrow>
			<Text className={styles.title} weight="semibold" truncate>{title}</Text>
		</Tooltip>
	);
}
