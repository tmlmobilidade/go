'use client';

/* * */

import { AcceptanceStatusProps } from '@/components/common/AcceptanceStatusTag';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { cloneElement } from 'react';

import styles from './styles.module.css';

/* * */

export function RidesDetailAcceptanceCommentItemStatus({ comment }: { comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> }) {
	//
	// A. Render components

	return (
		<>
			{cloneElement(AcceptanceStatusProps[comment.curr_value].icon, { style: { backgroundColor: 'var(--color-system-background-100)', zIndex: 2 } })}

			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{comment.curr_value ? 'A aceitação foi bloqueada por ${by}' : 'A aceitação foi desbloqueada por ${by}'}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</>
	);
}
