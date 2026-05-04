'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsItem } from '@/components/patterns/stops/StopsItem';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCirclePlus, IconX } from '@tabler/icons-react';
import { Path } from '@tmlmobilidade/types';
import { DraggableList, IconButton, Section, Select, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';

/* * */

export function StopsList() {
	const patternDetailContext = usePatternDetailContext();
	const stopsEditorContext = useStopsEditorContext();
	const stopsContext = useStopsContext();

	const [addStopIndex, setAddStopIndex] = useState<null | number>(null);
	const [selectedStopId, setSelectedStopId] = useState<null | string>(null);
	const [highlightedStopId, setHighlightedStopId] = useState<null | string>(null);

	const path = stopsEditorContext.data.path;
	const defaultRule = patternDetailContext.data.stopsParameterRules?.find(rule => rule.kind === 'default');

	const stopOptions = stopsContext.data.raw.map(stop => ({
		label: `${stop.name} (#${stop._id})`,
		value: String(stop._id),
	})) ?? [];

	const handleReorder = (
		newPath: Path[],
		event: { newIndex: number, oldIndex: number },
	) => {
		const moved = path[event.oldIndex];

		if (moved) {
			setHighlightedStopId(moved._id);

			setTimeout(() => {
				setHighlightedStopId(null);
			}, 900);
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
					renderItem={({ dragHandle, index, isLast, item: pathItem }) => (
						<Section
							flexDirection="row"
							gap="xs"
							padding="none"
							className={
								pathItem._id === highlightedStopId
									? styles.justDropped
									: undefined
							}
						>
							{dragHandle}

							<Section padding="none">
								<StopsItem pathItem={pathItem} rowIndex={index} />

								{!isLast && (
									<div className={styles.connectionInfo}>
										{addStopIndex === index ? (
											<>
												<div className={styles.addStopSelect}>
													<Select
														data={stopOptions}
														onChange={handleSelectStop}
														placeholder="Pesquisar paragem..."
														value={selectedStopId}
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

												<Text className={styles.info} data-loading={stopsEditorContext.flags.isLoadingRoute}>
													{path[index + 1]?.distance_delta ?? 0} m
												</Text>

												{/* <Text className={styles.info}>|</Text>

														<Text className={styles.info}>
															{defaultRule?.path[index + 1]?.avg_speed} km/h
														</Text> */}
											</>
										)}
									</div>
								)}
							</Section>
						</Section>
					)}
				/>
			</Section>
		</div>
	);
}
