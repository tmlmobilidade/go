'use client';

import styles from './styles.module.css';

import { CommentItem, CommentItemProps } from '../CommentItem';

/* * */
interface CommentListProps {
	data: CommentItemProps[]
	maxHeight?: number
	reverse?: boolean
}

export function CommentList({ data, maxHeight, reverse }: CommentListProps) {
	//
	// B. Render components

	if (!data) return null;

	return (
		<div className={styles.container} data-reverse={reverse} style={{ maxHeight: maxHeight && `${maxHeight}px` }}>
			{(reverse ? data.toReversed() : data).map((comment, index) =>
				<CommentItem key={index} {...comment} reverse={reverse} />,
			)}
		</div>
	);
}
