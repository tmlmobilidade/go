'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { CommentBox, Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import React from 'react';

import styles from './styles.module.css';

import { RidesDetailAcceptanceCommentItemCrud } from '../RideDetailAcceptanceCommentItemCrud';
import { RidesDetailAcceptanceCommentItemLock } from '../RideDetailAcceptanceCommentItemLock';
import { RidesDetailAcceptanceCommentItemNote } from '../RideDetailAcceptanceCommentItemNote';
import { RidesDetailAcceptanceCommentItemStatus } from '../RideDetailAcceptanceCommentItemStatus';

/* * */

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
				{acceptanceContext.data.acceptance.comments.map((comment, index) => (
					<React.Fragment key={index}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote comment={comment} />}
						{comment.type === 'crud' && <RidesDetailAcceptanceCommentItemCrud comment={comment} />}
						{comment.type === 'field_changed' && comment.field === 'acceptance_status' && <RidesDetailAcceptanceCommentItemStatus comment={comment as FieldChangedComment<RideAcceptance, 'acceptance_status'>} />}
						{comment.type === 'field_changed' && comment.field === 'is_locked' && <RidesDetailAcceptanceCommentItemLock comment={comment as FieldChangedComment<RideAcceptance, 'is_locked'>} />}
					</React.Fragment>
				))}
			</div>
			<CommentBox
				disabled={acceptanceContext.data.acceptance.is_locked}
				onSubmit={addComment}
			/>
		</Section>
	);
}
