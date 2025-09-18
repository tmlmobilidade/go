'use client';

/* * */

import { RideDetailAcceptanceCommentItemWrapper } from '@/components/rides/detail/acceptance/RideDetailAcceptanceCommentItemWrapper';
import { IconCircleDashedLetterC } from '@tabler/icons-react';
import { NoteComment } from '@tmlmobilidade/types';
import { Label } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemNote({ comment }: { comment: NoteComment }) {
	return (
		<RideDetailAcceptanceCommentItemWrapper icon={<IconCircleDashedLetterC color="var(--color-system-text-200)" style={{ marginTop: '10px' }} />}>
			<div className={styles.messageContainer}>
				<div className={styles.label}>{comment.message}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</div>
		</RideDetailAcceptanceCommentItemWrapper>
	);
}
