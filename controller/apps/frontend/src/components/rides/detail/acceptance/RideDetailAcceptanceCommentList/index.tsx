'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { CommentBox, Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

import { RidesDetailAcceptanceCommentItemCrud } from '../RideDetailAcceptanceCommentItemCrud';
import { RidesDetailAcceptanceCommentItemNote } from '../RideDetailAcceptanceCommentItemNote';

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
				<div className={styles.path} />
				{acceptanceContext.data.acceptance.comments.map(comment => (
					<div key={comment._id} className={styles.item}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote comment={comment} />}
						{comment.type === 'crud' && <RidesDetailAcceptanceCommentItemCrud comment={comment} />}
					</div>
				))}
			</div>
			<CommentBox
				disabled={acceptanceContext.data.acceptance.is_locked}
				onSubmit={addComment}
			/>
		</Section>
	);
}
