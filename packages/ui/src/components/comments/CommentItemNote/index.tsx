/* * */

import { IconMessageCircle } from '@tabler/icons-react';
import { NoteComment } from '@tmlmobilidade/go-types-shared';

import { displayUnixMilliseconds } from '../../../utils';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { CommentItem } from '../CommentItem';

/* * */

export interface CommentItemNoteProps {
	comment: NoteComment
	reverse?: boolean
}

export function CommentItemNote({ comment, reverse }: CommentItemNoteProps) {
	//

	//
	// A. Render components

	const content = (
		<Section flexDirection="column" padding="none">
			<div style={{ fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>
				{comment.message}
			</div>
			<Label size="sm">
				{comment.created_by} a {displayUnixMilliseconds(comment.created_at, 'short')}
			</Label>
		</Section>
	);

	return (
		<CommentItem
			content={content}
			created_at={comment.created_at}
			created_by={comment.created_by}
			icon={<IconMessageCircle color="var(--color-primary)" />}
			iconTopMargin={0}
			reverse={reverse}
		/>
	);

	//
}
