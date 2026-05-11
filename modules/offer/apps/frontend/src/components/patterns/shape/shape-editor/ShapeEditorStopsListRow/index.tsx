'use client';

/* * */

import { IconCirclePlus, IconX } from '@tabler/icons-react';
import { PopulatedPath } from '@tmlmobilidade/types';
import { IconButton, Select, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';

/* * */

function SegmentInfo({ afterStopId, beforeStopId, distance }: {
	afterStopId: number
	beforeStopId: number
	distance: number
}) {
	const stopsEditorContext = useStopsEditorContext();
	const isLoading = stopsEditorContext.flags.isLoadingRoute;

	const anchorCount = stopsEditorContext.data.anchors?.filter(
		a => a.after_stop_id === afterStopId && a.before_stop_id === beforeStopId,
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

export function StopsListRow({ index, isAdding, nextPathItem, onAdd, onCancel, onSelect, pathItem, selectedStopId, stopOptions }: { index: number, isAdding: boolean, nextPathItem: PopulatedPath | undefined, onAdd: (index: number) => void, onCancel: () => void, onSelect: (stopId: null | string) => void, pathItem: PopulatedPath, selectedStopId: null | string, stopOptions: { label: string, value: string }[] }) {
	//

	//
	// A. Render components

	return (
		<div className={styles.connectionInfo}>
			{isAdding ? (
				<>
					<div className={styles.addStopSelect}>
						<Select
							data={stopOptions}
							onChange={onSelect}
							placeholder="Pesquisar paragem..."
							value={selectedStopId}
							styles={{
								wrapper: {
									border: 'none',
								},
							}}
						/>
					</div>

					<IconButton
						color="var(--color-system-text-200)"
						icon={<IconX size={16} />}
						onClick={onCancel}
						tooltip="Cancelar"
					/>
				</>
			) : (
				<>
					<IconButton
						color="var(--color-system-text-200)"
						icon={<IconCirclePlus size={16} />}
						onClick={() => onAdd(index)}
						tooltip="Adicionar paragem"
					/>

					{nextPathItem && (
						<SegmentInfo
							afterStopId={pathItem.stop_id}
							beforeStopId={nextPathItem.stop_id}
							distance={nextPathItem.distance_delta ?? 0}
						/>
					)}
				</>
			)}
		</div>
	);
}
