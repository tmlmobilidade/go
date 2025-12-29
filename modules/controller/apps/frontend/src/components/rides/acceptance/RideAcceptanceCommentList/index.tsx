'use client';

/* * */

import { RideAnalysisAnalysisResultItem } from '@/components/rides/analysis/RideAnalysisResultItem';
import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { IconAlertCircle, IconCircleCheck, IconCircleDashedLetterC, IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX, IconCircleFilled, IconCircleX, IconClock, IconLock, IconLockOpen, IconMathMaxMin, IconMessageCircle } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { RideAcceptance, UserDisplay } from '@tmlmobilidade/types';
import { CommentInput, CommentItemProps, CommentList, Label, Section, Tooltip } from '@tmlmobilidade/ui';
import { createElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RideAcceptanceCommentList() {
	//

	//
	// A. Setup variables

	const acceptanceContext = useRideAcceptanceContext();

	const { t } = useTranslation('controller', { keyPrefix: 'rides.acceptance.comments' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });
	const { t: tAcceptance } = useTranslation('controller', { keyPrefix: 'rides.acceptance' });

	const CommentAcceptanceStatusProps = Object.freeze({
		accepted: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleCheck,
			label: t('acceptance_status.accepted'),
		},
		justification_required: {
			color: 'var(--color-status-warning-primary)',
			icon: IconAlertCircle,
			label: t('acceptance_status.justification_required'),
		},
		rejected: {
			color: 'var(--color-status-danger-primary)',
			icon: IconCircleX,
			label: t('acceptance_status.rejected'),
		},
		under_review: {
			color: 'var(--color-status-warning-primary)',
			icon: IconClock,
			label: t('acceptance_status.under_review'),
		},
	});

	const CommentCrudProps = Object.freeze({
		archive: {
			color: 'var(--color-status-warning-primary)',
			icon: IconCircleDashedMinus,
			label: tGlobal('archive'),
		},
		create: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleDashedPlus,
			label: tGlobal('create'),
		},
		delete: {
			color: 'var(--color-status-danger-primary)',
			icon: IconCircleDashedX,
			label: tGlobal('delete'),
		},
		restore: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleDashedLetterR,
			label: tGlobal('restore'),
		},
		update: {
			color: 'var(--color-status-warning-primary)',
			icon: IconCircleDashedLetterU,
			label: tGlobal('update'),
		},
	});

	const CommentLockProps = Object.freeze({
		lock: {
			color: 'var(--color-status-danger-primary)',
			icon: IconLock,
			label: t('lock.lock'),
		},
		unlock: {
			color: 'var(--color-status-success-primary)',
			icon: IconLockOpen,
			label: t('lock.unlock'),
		},
	});

	const CommentNoteProps = Object.freeze({
		color: 'var(--color-system-text-200)',
		icon: IconCircleDashedLetterC,
		label: t('note.created'),
	});

	const CommentJustificationProps = Object.freeze({
		color: 'var(--color-primary)',
		icon: IconMessageCircle,
		label: t('justification.updated'),
	});

	const CommentAnalysisSummaryProps = Object.freeze({
		color: 'var(--color-primary)',
		icon: IconMathMaxMin,
		label: t('summary.performed'),
	});

	const commentItems = useMemo(() => {
		return acceptanceContext.data.acceptance.comments.map((comment) => {
			const createdBy = comment.created_by === 'system' ? 'Sistema' : (comment.created_by as unknown as UserDisplay)?.first_name + ' ' + (comment.created_by as unknown as UserDisplay)?.last_name;
			const item: CommentItemProps = { content: null, created_at: comment.created_at, created_by: createdBy, icon: null };

			if (comment.type === 'field_changed' && comment.field === 'acceptance_status') {
				item.icon = createElement(CommentAcceptanceStatusProps[comment.curr_value].icon, { color: CommentAcceptanceStatusProps[comment.curr_value].color });
				item.content = CommentAcceptanceStatusProps[comment.curr_value].label;
			}

			if (comment.type === 'field_changed' && comment.field === 'is_locked') {
				item.icon = createElement(CommentLockProps[comment.curr_value ? 'lock' : 'unlock'].icon, { color: CommentLockProps[comment.curr_value ? 'lock' : 'unlock'].color });
				item.content = CommentLockProps[comment.curr_value ? 'lock' : 'unlock'].label;
			}

			if (comment.type === 'field_changed' && comment.field === 'justification') {
				item.icon = createElement(CommentJustificationProps.icon, { color: CommentJustificationProps.color });
				item.content = CommentJustificationProps.label;
			}

			if (comment.type === 'field_changed' && comment.field === 'analysis_summary') {
				item.iconTopMargin = 25;
				item.icon = createElement(CommentAnalysisSummaryProps.icon, { color: CommentAnalysisSummaryProps.color });

				const analysisSummary = comment.curr_value as RideAcceptance['analysis_summary'];
				const analysisItems = Object.entries(analysisSummary).map(([id, item]) => ({ id, ...item }));

				item.content = (
					<div className={styles.messageContainer}>
						<div className={styles.label}>{CommentAnalysisSummaryProps.label}</div>
						<Section flexDirection="row" gap="xs" padding="none">
							{analysisItems.map(item => (
								<Tooltip
									key={item.id}
									label={<RideAnalysisAnalysisResultItem grade={item.grade} id={item.id} />}
									p={0}
									radius="md"
								>
									<IconCircleFilled
										size={18}
										color={(item.grade === 'fail' || item.grade === 'error')
											? 'var(--color-status-danger-primary)'
											: 'var(--color-status-success-primary)'}
									/>
								</Tooltip>
							))}
						</Section>
						<Label size="sm">{createdBy} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
					</div>
				);
			}

			if (comment.type === 'note') {
				item.icon = createElement(CommentNoteProps.icon, { color: CommentNoteProps.color });
				item.iconTopMargin = 25;
				item.content = (
					<div className={styles.messageContainer}>
						<div className={styles.label}>{comment.message}</div>
						<Label size="sm">{createdBy} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
					</div>
				);
			}

			if (comment.type === 'crud') {
				item.icon = createElement(CommentCrudProps[comment.action].icon, { color: CommentCrudProps[comment.action].color });
				item.content = CommentCrudProps[comment.action].label;
			}

			return item;
		});
	}, [acceptanceContext.data.acceptance.comments]);

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
			<Label size="lg" caps>{tAcceptance('title')}</Label>
			<CommentList data={commentItems} maxHeight={500} reverse />
			<CommentInput
				disabled={acceptanceContext.data.acceptance.is_locked}
				onSubmit={addComment}
			/>
		</Section>
	);
}
