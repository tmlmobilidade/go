'use client';

/* * */

import Header from '@/components/common/Header';
import { TextArea } from '@tmlmobilidade/ui';

/* * */

import { Comment } from '@tmlmobilidade/types';

import styles from '../styles.module.css';

/* * */

interface CommentsProps {
	comments: Comment
}

export default function Comments({ comments }: CommentsProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Texto livre para informações adicionais."
				title="Notas e Comentários"
			/>

			{comments.map((comment) => {
				return (
					<div key={comment._id}>
						<div>ID: {comment._id}</div>
						<div>USER ID: {comment.user_id}</div>
						<div>TEXT: {comment.text}</div>
					</div>
				);
			})}
		</div>
	);
}
