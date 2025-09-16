'use client';

/* * */

import { NoteComment } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemNote({ comment }: { comment: NoteComment }) {
	return (
		<div className={styles.label}>
			{comment.message}
		</div>
	);
}
