'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { CommentBox, Label, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { RidesDetailAcceptanceCommentItemCrud } from '../RideDetailAcceptanceCommentItemCrud';
import { RidesDetailAcceptanceCommentItemNote } from '../RideDetailAcceptanceCommentItemNote';

/* * */

export function RidesDetailAcceptanceCommentList() {
	//

	//
	// A. Setup variables

	const { data: { acceptance } } = useRidesDetailAcceptanceContext();

	//
	// B. Render components

	if (!acceptance) return null;

	return (
		<Section gap="md" width="100%">
			<Label size="lg" caps>Atividade</Label>
			<div className={styles.container}>
				<div className={styles.path} />
				{acceptance.comments.map(comment => (
					<div key={comment._id} className={styles.item}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote comment={comment} />}
						{comment.type === 'crud' && <RidesDetailAcceptanceCommentItemCrud comment={comment} />}
					</div>
				))}
				{acceptance.comments.map(comment => (
					<div key={comment._id} className={styles.item}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote comment={comment} />}
						{comment.type === 'crud' && <RidesDetailAcceptanceCommentItemCrud comment={comment} />}
					</div>
				))}
			</div>
			<CommentBox
				disabled={acceptance.is_locked}
				onSubmit={v => alert(v)}
			/>
		</Section>
	);
}
