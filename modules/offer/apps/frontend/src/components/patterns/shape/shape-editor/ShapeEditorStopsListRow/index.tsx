'use client';

/* * */

import { IconCirclePlus, IconX } from '@tabler/icons-react';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { IconButton, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useShapeEditorContext } from '../ShapeEditor.context';
import { ShapeEditorStopSelect } from '../ShapeEditorStopSelect';

/* * */

function SegmentInfo({ afterPathItemId, beforePathItemId, distance }: { afterPathItemId: string, beforePathItemId: string,	distance: number }) {
	const shapeEditorContext = useShapeEditorContext();
	const isLoading = shapeEditorContext.flags.isLoadingRoute;

	const anchorCount = shapeEditorContext.data.anchors?.filter(
		a => a.after_path_item_id === afterPathItemId && a.before_path_item_id === beforePathItemId,
	).length ?? 0;

	return (
		<>
			<Text className={styles.info} data-loading={isLoading}>
				{distance} m
			</Text>

			{anchorCount > 0 && (
				<Text className={styles.info} data-loading={isLoading}>
					· {anchorCount} {anchorCount === 1 ? 'desvio' : 'desvios'}
				</Text>
			)}
		</>
	);
}

/* * */

export function StopsListRow({ index, isAdding, nextPathItem, onAdd, onCancel, onSelect, pathItem }: { index: number, isAdding: boolean, nextPathItem: PatternsDetailPathItem | undefined, onAdd: (index: number) => void, onCancel: () => void, onSelect: (stop: null | Stop) => void, pathItem: PatternsDetailPathItem }) {
	//

	//
	// A. Render components

	const { t } = useTranslation();
	return (
		<div className={styles.connectionInfo}>
			{isAdding ? (
				<>
					<div className={styles.addStopSelect}>
						<ShapeEditorStopSelect
							excludeStopIds={[pathItem.stop_id]}
							onChange={onSelect}
							value={null}
						/>
					</div>

					<IconButton
						color="var(--color-system-text-200)"
						icon={<IconX size={16} />}
						onClick={onCancel}
						tooltip={t('patterns:shape.StopsListRow.cancel')}
					/>
				</>
			) : (
				<>
					<IconButton
						color="var(--color-system-text-200)"
						icon={<IconCirclePlus size={16} />}
						onClick={() => onAdd(index)}
						tooltip={t('patterns:shape.StopsListRow.add_stop')}
					/>

					{nextPathItem && (
						<SegmentInfo
							afterPathItemId={pathItem._id}
							beforePathItemId={nextPathItem._id}
							distance={nextPathItem.distance_delta ?? 0}
						/>
					)}
				</>
			)}
		</div>
	);
}
