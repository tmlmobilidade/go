'use client';

import { useRideAcceptanceData } from '@/components/rides/detail/acceptance/use-ride-acceptance-data';
import { IconAlertCircle, IconCircleCheck, IconCircleDashedLetterC, IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX, IconCircleFilled, IconCircleX, IconClock, IconLock, IconLockOpen, IconMathMaxMin, IconMessageCircle } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { UserDisplay } from '@tmlmobilidade/go-types-core';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { CommentInput, CommentItemProps, CommentList, displayUnixMilliseconds, fetchApiData, HasPermission, Label, Section, Tooltip, useHandleAction } from '@tmlmobilidade/ui';
import React, { createElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';
import styles from './styles.module.css';

/* * */

export function RideAcceptanceCommentList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { data: acceptance, mutate } = useRideAcceptanceData();

	const CommentAcceptanceStatusProps = Object.freeze({
		accepted: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleCheck,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.acceptance_status.accepted'),
		},
		justification_required: {
			color: 'var(--color-status-warning-primary)',
			icon: IconAlertCircle,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.acceptance_status.justification_required'),
		},
		rejected: {
			color: 'var(--color-status-danger-primary)',
			icon: IconCircleX,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.acceptance_status.rejected'),
		},
		under_review: {
			color: 'var(--color-status-warning-primary)',
			icon: IconClock,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.acceptance_status.under_review'),
		},
	});

	const CommentCrudProps = Object.freeze({
		archive: {
			color: 'var(--color-status-warning-primary)',
			icon: IconCircleDashedMinus,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.crud.archive'),
		},
		create: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleDashedPlus,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.crud.create'),
		},
		delete: {
			color: 'var(--color-status-danger-primary)',
			icon: IconCircleDashedX,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.crud.delete'),
		},
		restore: {
			color: 'var(--color-status-success-primary)',
			icon: IconCircleDashedLetterR,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.crud.restore'),
		},
		update: {
			color: 'var(--color-status-warning-primary)',
			icon: IconCircleDashedLetterU,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.crud.update'),
		},
	});

	const CommentLockProps = Object.freeze({
		lock: {
			color: 'var(--color-status-danger-primary)',
			icon: IconLock,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.lock.lock'),
		},
		unlock: {
			color: 'var(--color-status-success-primary)',
			icon: IconLockOpen,
			label: t('default:rides.acceptance.RideAcceptanceCommentList.lock.unlock'),
		},
	});

	const CommentNoteProps = Object.freeze({
		color: 'var(--color-system-text-200)',
		icon: IconCircleDashedLetterC,
		label: t('default:rides.acceptance.RideAcceptanceCommentList.note.created'),
	});

	const CommentJustificationProps = Object.freeze({
		color: 'var(--color-primary)',
		icon: IconMessageCircle,
		label: t('default:rides.acceptance.RideAcceptanceCommentList.justification.updated'),
	});

	const CommentAnalysisSummaryProps = Object.freeze({
		color: 'var(--color-primary)',
		icon: IconMathMaxMin,
		label: t('default:rides.acceptance.RideAcceptanceCommentList.summary.performed'),
	});

	const commentItems = useMemo(() => {
		if (!acceptance?.comments) return [];

		return acceptance.comments.map((comment) => {
			const createdBy = comment.created_by === 'system'
				? t('default:rides.acceptance.RideAcceptanceCommentList.system')
				: `${(comment.created_by as unknown as UserDisplay)?.first_name} ${(comment.created_by as unknown as UserDisplay)?.last_name}`;
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

				const analysisItems: { grade: string, id: string }[] = [];

				item.content = (
					<div className={styles.messageContainer}>
						<div className={styles.label}>{CommentAnalysisSummaryProps.label}</div>
						<Section flexDirection="row" gap="xs" padding="none">
							{analysisItems.map(analysisItem => (
								<Tooltip
									key={analysisItem.id}
									label={analysisItem.grade}
									p={0}
									radius="md"
								>
									<IconCircleFilled
										size={18}
										color={(analysisItem.grade === 'fail' || analysisItem.grade === 'error')
											? 'var(--color-status-danger-primary)'
											: 'var(--color-status-success-primary)'}
									/>
								</Tooltip>
							))}
						</Section>
						<Label size="sm">{createdBy} a {displayUnixMilliseconds(comment.created_at, 'short')}</Label>
					</div>
				);
			}

			if (comment.type === 'note') {
				item.icon = createElement(CommentNoteProps.icon, { color: CommentNoteProps.color });
				item.iconTopMargin = 25;
				item.content = (
					<div className={styles.messageContainer}>
						<div className={styles.label}>{comment.message}</div>
						<Label size="sm">{createdBy} a {displayUnixMilliseconds(comment.created_at, 'short')}</Label>
					</div>
				);
			}

			if (comment.type === 'crud') {
				item.icon = createElement(CommentCrudProps[comment.action].icon, { color: CommentCrudProps[comment.action].color });
				item.content = CommentCrudProps[comment.action].label;
			}

			return item;
		});
	}, [CommentAcceptanceStatusProps, CommentAnalysisSummaryProps.color, CommentAnalysisSummaryProps.icon, CommentAnalysisSummaryProps.label, CommentCrudProps, CommentJustificationProps.color, CommentJustificationProps.icon, CommentJustificationProps.label, CommentLockProps, CommentNoteProps.color, CommentNoteProps.icon, acceptance?.comments, t]);

	//
	// B. Handle actions

	const { action: handleAddComment, isLoading: isAddingComment } = useHandleAction<RideAcceptance, NoteComment>({
		fetchFn: async comment => await fetchApiData<RideAcceptance, NoteComment>({
			body: comment,
			method: 'POST',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_COMMENT(rideId),
		}),
		onSuccess: () => {
			mutate();
		},
	});

	function addComment(comment: string) {
		const now = Dates.now('Europe/Lisbon').unix_milliseconds;
		handleAddComment({
			created_at: now,
			created_by: 'will-be-set-by-api',
			message: comment,
			type: 'note',
			updated_at: now,
		});
	}

	//
	// C. Render components

	if (!acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>{t('default:rides.acceptance.RideAcceptance.title')}</Label>
			<CommentList data={commentItems} maxHeight={500} reverse />
			<HasPermission action={PermissionCatalog.all.rides.actions.acceptance_comment_activity} scope={PermissionCatalog.all.rides.scope}>
				<CommentInput
					disabled={acceptance.is_locked || isAddingComment}
					onSubmit={addComment}
				/>
			</HasPermission>
		</Section>
	);

	//
}
