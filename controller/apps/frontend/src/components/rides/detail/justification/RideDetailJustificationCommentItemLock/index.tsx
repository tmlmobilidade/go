'use client';

/* * */

import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

export function RidesDetailJustificationChangelogLock({ comment }: { comment: FieldChangedComment<RideAcceptance, 'is_locked'> }) {
	if (comment.field === 'is_locked') return null;

	function getVariant(status: RideAcceptance['is_locked']) {
		switch (status) {
			case false:
				return 'success';
			case true:
				return 'danger';
		}
	}

	return (
		<div className={styles.label}>
			{comment.updated_by}
			<span data-variant={getVariant(comment.prev_value as RideAcceptance['is_locked'])}>{comment.prev_value ? 'bloqueou' : 'desbloqueou'}</span> a análise para alterações
		</div>
	);
}
