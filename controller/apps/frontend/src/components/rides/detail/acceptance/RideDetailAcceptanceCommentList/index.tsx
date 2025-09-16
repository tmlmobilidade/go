'use client';

/* * */

import { RideAcceptance } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { RidesDetailAcceptanceCommentItemNote } from '../RideDetailAcceptanceCommentItemNote';

/* * */

export function RidesDetailAcceptanceCommentList({ items }: { items: RideAcceptance['comments'] }) {
	return (
		<Section>
			<Label size="lg" caps>Comments</Label>
			<div className={styles.container}>
				<div className={styles.path} />
				{items.map(comment => (
					<div className={styles.item}>
						{comment.type === 'note' && <RidesDetailAcceptanceCommentItemNote key={comment._id} comment={comment} />}
					</div>
				))}
			</div>
		</Section>
	);
}
