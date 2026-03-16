/* * */

import { IconMessageCircle } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { NoteComment } from '@tmlmobilidade/types';

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
				{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}
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
