/* * */

import { IconEdit, IconRestore } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { FieldChange, FieldChangedComment } from '@tmlmobilidade/types';

import styles from './styles.module.css';

import { IconButton } from '../../buttons';
import { Label } from '../../display/Label';

/* * */

export interface CommentItemFieldProps {
	comment: FieldChangedComment
	onRevert?: (changes: Record<string, unknown>) => void
	reverse?: boolean
}

/* * */

export function CommentItemField({ comment, onRevert, reverse }: CommentItemFieldProps) {
	//

	//
	// A. Setup variables

	const isMultipleFields = comment.field === 'multiple_fields';

	const changes = (isMultipleFields && comment.metadata?.changes ? comment.metadata.changes : []) as FieldChange[];

	const fieldNames = isMultipleFields
		? changes.map(c => c.field).join(', ')
		: String(comment.field);

	const createdBy = typeof comment.created_by === 'string'
		? comment.created_by
		: 'Unknown User';

	//
	// B. Handle actions

	const handleRevert = () => {
		if (!onRevert || !isMultipleFields) return;

		// Convert changes array back to an object
		const revertData = changes.reduce<Record<string, unknown>>((acc, change) => {
			acc[change.field] = change.prev_value;
			return acc;
		}, {});

		onRevert(revertData);
	};

	//
	// C. Render components

	return (
		<div className={styles.item} data-reverse={reverse}>
			<div className={styles.itemWrapper}>
				<div className={styles.icon}>
					<IconEdit color="var(--color-primary)" />
				</div>
				<div className={styles.path} />
			</div>
			<div className={styles.card}>
				<div>
					<div className={styles.message}>
						<span>Campos</span> <span className={styles.fieldNames}>{fieldNames}</span> <span>atualizado{isMultipleFields ? 's' : ''}</span>
					</div>
					<div className={styles.footer}>
						<Label size="sm">
							{createdBy} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}
						</Label>
					</div>
				</div>
				{onRevert && isMultipleFields && (
					<IconButton
						icon={<IconRestore size={16} />}
						onClick={handleRevert}
						tooltip="Reverter"
						variant="muted"
					/>
				)}
			</div>
		</div>
	);

	//
}
