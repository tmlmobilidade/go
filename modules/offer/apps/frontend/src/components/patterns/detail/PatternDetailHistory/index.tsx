'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { updateShapeEditorDraft } from '@/utils/shape-editor-draft';
import { IconHistory } from '@tabler/icons-react';
import { type PatternsDetailFormDto } from '@tmlmobilidade/go-offer-pckg-types';
import { CommentInput, CommentItemField, CommentItemNote, Menu } from '@tmlmobilidade/ui';
import { useToast } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function PatternDetailHistory() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const [revertingIndex, setRevertingIndex] = useState<null | number>(null);
	const latest = useRef(patternDetailContext);
	latest.current = patternDetailContext;
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const handleRevert = useCallback(async (idx: number, revertData: Partial<PatternsDetailFormDto>) => {
		if (!mounted.current || !latest.current.capabilities.editEnabled) return;
		const patternId = latest.current.data.id;
		setRevertingIndex(idx);
		try {
			if (revertData.path) {
				const enrichedPath = await latest.current.actions.enrichPath(revertData.path);
				if (!mounted.current || !latest.current.capabilities.editEnabled || latest.current.data.id !== patternId) return;
				const current = latest.current;
				const draft = updateShapeEditorDraft({ parameters: current.form.getValues().parameters, path: current.data.path, shape: current.data.shape ?? undefined }, enrichedPath, undefined);
				revertData = { ...revertData, parameters: draft.parameters, path: enrichedPath, shape: null };
			}
			latest.current.actions.applyChanges(revertData);
			useToast.info({ message: 'Campos revertidos. Clique em Guardar para persistir as alterações.' });
		} finally {
			if (mounted.current) setRevertingIndex(null);
		}
	}, []);

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
				<div className={styles.comments}>
					{commentItems}
				</div>
			) : (
				<div className={styles.empty}>
					Nenhuma atividade registrada para este pattern.
				</div>
			)}
		</Menu>
	);

	//
}
