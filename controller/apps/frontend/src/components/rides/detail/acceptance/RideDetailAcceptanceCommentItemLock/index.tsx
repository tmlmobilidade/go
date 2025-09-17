'use client';

/* * */

import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemLock({ comment }: { comment: FieldChangedComment<RideAcceptance, 'is_locked'> }) {
	//
	// A. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			{
				comment.curr_value
					? <IconLock color="var(--color-status-danger-primary)" style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
					: <IconLockOpen color="var(--color-status-success-primary)" style={{ backgroundColor: 'var(--color-system-background-100)', zIndex: 2 }} />
			}
			<div className={styles.label}>{comment.curr_value ? 'A aceitação foi bloqueada por ${by}' : 'A aceitação foi desbloqueada por ${by}'}</div>
		</Section>
	);
}
