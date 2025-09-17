'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { CommentBox, Label, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

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
					<div className={styles.item}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote key={comment._id} comment={comment} />}
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
