'use client';

/* * */

import { IconCircleDashedLetterC } from '@tabler/icons-react';
import { NoteComment } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemNote({ comment }: { comment: NoteComment }) {
	return (
		<>
			<IconCircleDashedLetterC color="var(--color-system-text-200)" style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{comment.message}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</>
	);
}
