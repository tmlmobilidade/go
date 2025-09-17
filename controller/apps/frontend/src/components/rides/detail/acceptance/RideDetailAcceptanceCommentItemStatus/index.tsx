'use client';

/* * */

import { IconAlertCircle, IconCircleCheck, IconCircleX, IconClock, IconProps } from '@tabler/icons-react';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createElement } from 'react';

import styles from '../styles.module.css';

/* * */

const AcceptanceStatusProps: Record<RideAcceptance['acceptance_status'], { icon: React.ComponentType<IconProps>, label: string, style: { color: string } }> = Object.freeze({
	accepted: {
		icon: IconCircleCheck,
		label: 'A aceitação está aceite',
		style: { color: 'var(--color-status-success-primary)' },
	},
	justification_required: {
		icon: IconAlertCircle,
		label: 'É necessário justificar a aceitação',
		style: { color: 'var(--color-status-warning-primary)' },
	},
	rejected: {
		icon: IconCircleX,
		label: 'A aceitação está rejeitada',
		style: { color: 'var(--color-status-danger-primary)' },
	},
	under_review: {
		icon: IconClock,
		label: 'A aceitação está em revisão',
		style: { color: 'var(--color-status-warning-primary)' },
	},
});

export function RidesDetailAcceptanceCommentItemStatus({ comment }: { comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> }) {
	//
	// A. Render components

	return (
		<>
			{createElement(AcceptanceStatusProps[comment.curr_value].icon, { style: { backgroundColor: 'var(--color-system-background-100)', zIndex: 2, ...AcceptanceStatusProps[comment.curr_value].style } })}

			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{AcceptanceStatusProps[comment.curr_value].label}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</>
	);
}
