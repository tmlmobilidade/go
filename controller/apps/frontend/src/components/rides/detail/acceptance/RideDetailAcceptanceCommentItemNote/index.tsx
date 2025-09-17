'use client';

/* * */

import { IconCircleDashed } from '@tabler/icons-react';
import { NoteComment } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemNote({ comment }: { comment: NoteComment }) {
	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			<IconCircleDashed style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
			<div className={styles.label}>{comment.message}</div>
		</Section>
	);
}
