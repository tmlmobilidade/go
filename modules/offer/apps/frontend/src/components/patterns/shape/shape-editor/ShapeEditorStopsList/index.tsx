'use client';

/* * */

import { ShapeEditorStopsItem } from '@/components/patterns/shape/shape-editor/ShapeEditorStopsItem';
import { useStopsContext } from '@/contexts/Stops.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PopulatedPath, Stop } from '@tmlmobilidade/types';
import { DraggableList, Section, Text, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useState } from 'react';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';
import { StopsListRow } from '../ShapeEditorStopsListRow';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

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

	//
	// B. Handle actions

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

	const handleSelectStop = async (stopId: null | string) => {
		if (!stopId || addStopIndex === null) return;
		setSelectedStopId(stopId);

		const selectedStopResult = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(stopId));
		if (!selectedStopResult.isOk) {
			useToast.error({ message: selectedStopResult.error, title: 'Erro ao carregar paragem' });
			return;
		}

		void stopsEditorContext.actions.addStop(selectedStopResult.data, addStopIndex + 1);
		handleCancelAddStop();
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Text size="xl" weight="semibold">Sequência de paragens</Text>

			<Section padding="none">
				<DraggableList
					getId={pathItem => pathItem._id}
					items={path}
					onReorder={handleReorder}
					renderItem={({ dragHandle, index, item: pathItem }) => {
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

									<StopsListRow
										index={index}
										isAdding={isAddingHere}
										nextPathItem={nextPathItem}
										onAdd={handleStartAddStop}
										onCancel={handleCancelAddStop}
										onSelect={stopId => void handleSelectStop(stopId)}
										pathItem={pathItem}
										selectedStopId={selectedStopId}
										stopOptions={stopOptions}
									/>
								</Section>
							</Section>
						);
					}}
				/>
			</Section>
		</div>
	);
}
