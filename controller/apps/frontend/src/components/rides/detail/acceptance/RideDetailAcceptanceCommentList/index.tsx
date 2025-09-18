'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { IconAlertCircle, IconCircleCheck, IconCircleDashedLetterC, IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX, IconCircleX, IconClock, IconLock, IconLockOpen } from '@tabler/icons-react';
import { CommentBox, Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import React, { createElement } from 'react';

import styles from './styles.module.css';

import { RideDetailAcceptanceCommentItemWrapper } from '../RideDetailAcceptanceCommentItemWrapper';

/* * */

const CommentAcceptanceStatusProps = Object.freeze({
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

const CommentCrudProps = Object.freeze({
	archive: {
		color: 'var(--color-status-warning-primary)',
		icon: IconCircleDashedMinus,
		label: 'A aceitação foi arquivada',
	},
	create: {
		color: 'var(--color-status-success-primary)',
		icon: IconCircleDashedPlus,
		label: 'A aceitação foi criada por sistema',
	},
	delete: {
		color: 'var(--color-status-danger-primary)',
		icon: IconCircleDashedX,
		label: 'A aceitação foi apagada',
	},
	restore: {
		color: 'var(--color-status-success-primary)',
		icon: IconCircleDashedLetterR,
		label: 'A aceitação foi restaurada',
	},
	update: {
		color: 'var(--color-status-warning-primary)',
		icon: IconCircleDashedLetterU,
		label: 'A aceitação foi atualizada',
	},

});

const CommentLockProps = Object.freeze({
	lock: {
		color: 'var(--color-status-danger-primary)',
		icon: IconLock,
		label: 'A aceitação foi bloqueada',
	},
	unlock: {
		color: 'var(--color-status-success-primary)',
		icon: IconLockOpen,
		label: 'A aceitação foi desbloqueada',
	},

});

const CommentNoteProps = Object.freeze({
	color: 'var(--color-system-text-200)',
	icon: IconCircleDashedLetterC,
	label: 'A aceitação foi criada por sistema',

});

export function RidesDetailAcceptanceCommentList() {
	//

	//
	// A. Setup variables

	const acceptanceContext = useRidesDetailAcceptanceContext();

	//
	// B. Handle actions

	function addComment(comment: string) {
		acceptanceContext.actions.addComment({
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			message: comment,
			type: 'note',
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});
	}

	//
	// C. Render components

	if (!acceptanceContext.data.acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Atividade</Label>
			<div className={styles.container}>
				{acceptanceContext.data.acceptance.comments.map((comment, index) => {
					let icon: React.ReactNode;
					let content: React.ReactNode | string;
					let iconTopMargin: number;

					if (comment.type === 'field_changed' && comment.field === 'acceptance_status') {
						const iconKey = comment.curr_value;
						icon = createElement(CommentAcceptanceStatusProps[iconKey].icon, { color: CommentAcceptanceStatusProps[iconKey].color });
						content = CommentAcceptanceStatusProps[iconKey].label;
					}
					if (comment.type === 'field_changed' && comment.field === 'is_locked') {
						const iconKey = comment.curr_value ? 'lock' : 'unlock';
						icon = createElement(CommentLockProps[iconKey].icon, { color: CommentLockProps[iconKey].color });
						content = CommentLockProps[iconKey].label;
					}
					if (comment.type === 'note') {
						icon = createElement(CommentNoteProps.icon, { color: CommentNoteProps.color });
						iconTopMargin = 25;
						content = (
							<div className={styles.messageContainer}>
								<div className={styles.label}>{comment.message}</div>
								<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
							</div>
						);
					}
					if (comment.type === 'crud') {
						icon = createElement(CommentCrudProps[comment.action].icon, { color: CommentCrudProps[comment.action].color });
						content = CommentCrudProps[comment.action].label;
					}

					if (!icon || !content) return null;

					return (
						<RideDetailAcceptanceCommentItemWrapper key={index} content={content} created_at={comment.created_at} created_by={comment.created_by} icon={icon} iconTopMargin={iconTopMargin} />
					);
				})}
			</div>
			<CommentBox
				disabled={acceptanceContext.data.acceptance.is_locked}
				onSubmit={addComment}
			/>
		</Section>
	);
}
