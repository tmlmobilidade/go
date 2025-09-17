'use client';

/* * */

import { IconCircleDashed } from '@tabler/icons-react';
import { NoteComment } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemNote({ comment }: { comment: NoteComment }) {
	return (
		<>
			<IconCircleDashed style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
			<div className={styles.label}>{comment.message}</div>
		</>
	);
}
