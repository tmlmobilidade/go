'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconHistory } from '@tabler/icons-react';
import { type PatternsDetailFormDto } from '@tmlmobilidade/go-offer-pckg-types';
import { CommentInput, CommentItemField, CommentItemNote, Menu } from '@tmlmobilidade/ui';
import { useToast } from '@tmlmobilidade/ui';
import { useCallback, useMemo, useState } from 'react';

/* * */

export function PatternDetailHistory() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const [revertingIndex, setRevertingIndex] = useState<null | number>(null);

	const handleRevert = useCallback(async (idx: number, revertData: Partial<PatternsDetailFormDto>) => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		setRevertingIndex(idx);
		if (revertData.path) {
			const enrichedPath = await patternDetailContext.actions.enrichPath(revertData.path);
			revertData = { ...revertData, path: enrichedPath };
		}
		patternDetailContext.actions.applyChanges(revertData);
		useToast.info({ message: 'Campos revertidos. Clique em Guardar para persistir as alterações.' });
		setRevertingIndex(null);
	}, [patternDetailContext.capabilities.editEnabled, patternDetailContext.actions]);

	const commentItems = useMemo(() => {
		const allComments = (patternDetailContext.data.pattern.comments || []);

		const items = allComments.map((comment, idx) => {
			if (comment.type === 'field_changed') {
				return (
					<CommentItemField
						key={idx}
						comment={comment}
						loading={revertingIndex === idx}
						onRevert={!patternDetailContext.capabilities.editEnabled ? undefined : revertData => handleRevert(idx, revertData)}
					/>
				);
			}
			if (comment.type === 'note') {
				return (
					<CommentItemNote
						key={idx}
						comment={comment}
					/>
				);
			}
			return null;
		}).filter(Boolean);

		return [
			...items,
			<CommentInput
				key="comment-input"
				disabled={!patternDetailContext.capabilities.editEnabled}
				onSubmit={patternDetailContext.actions.addComment}
			/>,
		];
	}, [handleRevert, revertingIndex, patternDetailContext.actions.addComment, patternDetailContext.data.pattern.comments, patternDetailContext.capabilities.editEnabled]);

	//
	// C. Render components

	if (!patternDetailContext.data.pattern) return null;

	return (
		<Menu icon={IconHistory} label="Histórico" variant="primary" width={400}>
			{commentItems.length > 0 ? (
				<div style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px' }}>
					{commentItems}
				</div>
			) : (
				<div style={{ color: 'var(--color-system-text-400)', fontSize: 'var(--font-size-sm)', padding: '16px', textAlign: 'center' }}>
					Nenhuma atividade registrada para este pattern.
				</div>
			)}
		</Menu>
	);

	//
}
