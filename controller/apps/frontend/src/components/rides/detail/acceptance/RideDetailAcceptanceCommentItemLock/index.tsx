'use client';

/* * */

import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemLock({ comment }: { comment: FieldChangedComment<RideAcceptance, 'is_locked'> }) {
	//
	// A. Render components

	return (
		<>
			{
				comment.curr_value
					? <IconLock color="var(--color-status-danger-primary)" style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
					: <IconLockOpen color="var(--color-status-success-primary)" style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
			}
			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{comment.curr_value ? 'A aceitação foi bloqueada' : 'A aceitação foi desbloqueada'}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</>
	);
}
