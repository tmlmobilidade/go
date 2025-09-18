'use client';

/* * */

import { IconAlertCircle, IconCircleCheck, IconCircleX, IconClock, IconProps } from '@tabler/icons-react';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createElement } from 'react';

import styles from '../styles.module.css';

import { RideDetailAcceptanceCommentItemWrapper } from '../RideDetailAcceptanceCommentItemWrapper';

/* * */

const AcceptanceStatusProps: Record<RideAcceptance['acceptance_status'], { color: string, icon: React.ComponentType<IconProps>, label: string }> = Object.freeze({
	accepted: {
		color: 'var(--color-status-success-primary)',
		icon: IconCircleCheck,
		label: 'A aceitação está aceite',
	},
	justification_required: {
		color: 'var(--color-status-warning-primary)',
		icon: IconAlertCircle,
		label: 'É necessário justificar a aceitação',
	},
	rejected: {
		color: 'var(--color-status-danger-primary)',
		icon: IconCircleX,
		label: 'A aceitação está rejeitada',
	},
	under_review: {
		color: 'var(--color-status-warning-primary)',
		icon: IconClock,
		label: 'A aceitação está em revisão',
	},
});

export function RidesDetailAcceptanceCommentItemStatus({ comment }: { comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> }) {
	//
	// A. Render components

	return (
		<RideDetailAcceptanceCommentItemWrapper icon={createElement(AcceptanceStatusProps[comment.curr_value].icon, { color: AcceptanceStatusProps[comment.curr_value].color })}>
			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{AcceptanceStatusProps[comment.curr_value].label}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</RideDetailAcceptanceCommentItemWrapper>
	);
}
