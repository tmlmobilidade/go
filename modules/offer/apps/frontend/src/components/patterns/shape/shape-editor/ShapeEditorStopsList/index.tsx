'use client';

/* * */

import { ShapeEditorStopsItem } from '@/components/patterns/shape/shape-editor/ShapeEditorStopsItem';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCirclePlus, IconX } from '@tabler/icons-react';
import { PopulatedPath } from '@tmlmobilidade/types';
import { DraggableList, IconButton, Section, Select, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';

/* * */

function SegmentInfo({ afterStopId, beforeStopId, distance, isLoading }: {
	afterStopId: number
	beforeStopId: number
	distance: number
	isLoading: boolean
}) {
	const stopsEditorContext = useStopsEditorContext();

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

export function StopsList() {
	const stopsEditorContext = useStopsEditorContext();
	const stopsContext = useStopsContext();

	const [addStopIndex, setAddStopIndex] = useState<null | number>(null);
	const [selectedStopId, setSelectedStopId] = useState<null | string>(null);
	const [highlightedStopId, setHighlightedStopId] = useState<null | string>(null);

	const path = stopsEditorContext.data.path as PopulatedPath[];

	const stopOptions = stopsContext.data.raw.map(stop => ({
		label: `${stop.name} (#${stop._id})`,
		value: String(stop._id),
	}));

	const handleReorder = (newPath: PopulatedPath[], event: { newIndex: number, oldIndex: number }) => {
		const moved = path[event.oldIndex];
		if (moved) {
			setHighlightedStopId(moved._id);
			setTimeout(() => setHighlightedStopId(null), 900);
		}
		void stopsEditorContext.actions.reorderStops(newPath);
	};

	const handleStartAddStop = (index: number) => {
		setAddStopIndex(index);
		setSelectedStopId(null);
	};

	const handleCancelAddStop = () => {
		setAddStopIndex(null);
		setSelectedStopId(null);
	};

	const handleSelectStop = (stopId: null | string) => {
		if (!stopId || addStopIndex === null) return;
		const selectedStop = stopsContext.data.raw.find(stop => stop._id === Number(stopId));
		if (!selectedStop) return;
		void stopsEditorContext.actions.addStop(selectedStop, addStopIndex + 1);
		handleCancelAddStop();
	};

	return (
		<div className={styles.container}>
			<Text size="xl" weight="semibold">Sequência de paragens</Text>

			<Section padding="none">
				<DraggableList
					getId={pathItem => pathItem._id}
					items={path}
					onReorder={handleReorder}
					renderItem={({ dragHandle, index, isLast, item: pathItem }) => {
						const nextPathItem = path[index + 1];
						const isAddingHere = addStopIndex === index;

						return (
							<Section
								className={pathItem._id === highlightedStopId ? styles.justDropped : undefined}
								flexDirection="row"
								gap="xs"
								padding="none"
							>
								{dragHandle}

								<Section padding="none">
									<ShapeEditorStopsItem pathItem={pathItem} rowIndex={index} />

									{!isLast && (
										<div className={styles.connectionInfo}>
											{isAddingHere ? (
												<>
													<div className={styles.addStopSelect}>
														<Select
															data={stopOptions}
															onChange={handleSelectStop}
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
														onClick={handleCancelAddStop}
														tooltip="Cancelar"
													/>
												</>
											) : (
												<>
													<IconButton
														color="var(--color-system-text-200)"
														icon={<IconCirclePlus size={16} />}
														onClick={() => handleStartAddStop(index)}
														tooltip="Adicionar paragem"
													/>

													{nextPathItem && (
														<SegmentInfo
															afterStopId={pathItem.stop_id}
															beforeStopId={nextPathItem.stop_id}
															distance={nextPathItem.distance_delta ?? 0}
															isLoading={stopsEditorContext.flags.isLoadingRoute}
														/>
													)}
												</>
											)}
										</div>
									)}

									{isLast && (
										<div className={styles.connectionInfo}>
											{isAddingHere ? (
												<>
													<div className={styles.addStopSelect}>
														<Select
															data={stopOptions}
															onChange={handleSelectStop}
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
														onClick={handleCancelAddStop}
														tooltip="Cancelar"
													/>
												</>
											) : (
												<IconButton
													color="var(--color-system-text-200)"
													icon={<IconCirclePlus size={16} />}
													onClick={() => handleStartAddStop(index)}
													tooltip="Adicionar paragem no fim"
												/>
											)}
										</div>
									)}
								</Section>
							</Section>
						);
					}}
				/>
			</Section>
		</div>
	);
}
