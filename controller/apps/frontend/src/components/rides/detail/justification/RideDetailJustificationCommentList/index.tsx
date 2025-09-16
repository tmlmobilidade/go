'use client';

/* * */

import { RideAcceptance } from '@tmlmobilidade/types';
import { Label } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { RidesDetailJustificationCommentItemNote } from '../RideDetailJustificationCommentItemNote';

/* * */

export function RidesDetailJustificationCommentList({ items }: { items: RideAcceptance['comments'] }) {
	return (
		<>
			<Label size="lg" caps>Comments</Label>
			<div className={styles.container}>
				<div className={styles.path} />
				{items.map(comment => (
					<div className={styles.item}>
						{comment.type === 'note' && <RidesDetailJustificationCommentItemNote key={comment._id} comment={comment} />}
					</div>
				))}
			</div>
		</>
	);
}
