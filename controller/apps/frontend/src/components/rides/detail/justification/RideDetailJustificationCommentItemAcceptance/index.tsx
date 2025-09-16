'use client';

/* * */

import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

export function RidesDetailJustificationChangelogAcceptanceStatusChanged({ comment }: { comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> }) {
	if (comment.field !== 'acceptance_status') return null;

	function getVariant(status: RideAcceptance['acceptance_status']) {
		switch (status) {
			case 'accepted':
				return 'success';
			case 'justification_required':
				return 'danger';
			case 'under_review':
				return 'warning';
			default:
				return 'default';
		}
	}

	return (
		<div className={styles.label}>
			<strong>{comment.created_by}</strong> alterou o estado de aprovação de <span data-variant={getVariant(comment.prev_value)}>{comment.prev_value}</span> para <span data-variant={getVariant(comment.curr_value)}>{comment.curr_value}</span>
		</div>
	);
}
