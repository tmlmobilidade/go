'use client';

/* * */

import { Stop } from '@tmlmobilidade/types';
import { MapOverlayPatternShape, MapView, Section, Select, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from '../ShapeEditorContent/styles.module.css';

/* * */

interface InitialStopSelectorProps {
	isLoading: boolean
	lineColor: string | undefined
	lineData: unknown
	onInitialize: (firstStop: Stop, secondStop: Stop) => void
	stopOptions: { label: string, value: string }[]
	stopsRaw: Stop[]
}

/* * */

export function InitialStopSelector({ isLoading, lineColor, lineData, onInitialize, stopOptions, stopsRaw }: InitialStopSelectorProps) {
	//

	//
	// A. Setup variables

	const [firstStopId, setFirstStopId] = useState<null | string>(null);
	const [secondStopId, setSecondStopId] = useState<null | string>(null);

	//
	// B. Handle actions

	const handleFirst = (id: null | string) => {
		setFirstStopId(id);
		setSecondStopId(null);
	};

	const handleSecond = (id: null | string) => {
		setSecondStopId(id);
		if (!id || !firstStopId) return;
		const s1 = stopsRaw.find(s => s._id === Number(firstStopId));
		const s2 = stopsRaw.find(s => s._id === Number(id));
		if (s1 && s2) onInitialize(s1, s2);
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Section gap="md" width="30%">
				<Text size="xl" weight="semibold">Sequência de paragens</Text>
				<Text>Ainda não existem paragens neste percurso. Adicione as duas primeiras paragens para calcular o percurso.</Text>
				<Select
					data={stopOptions}
					disabled={isLoading}
					label="Primeira paragem"
					onChange={handleFirst}
					placeholder="Pesquisar paragem..."
					value={firstStopId}
					w="100%"
					searchable
				/>
				{firstStopId && (
					<Select
						data={stopOptions.filter(o => o.value !== firstStopId)}
						disabled={isLoading}
						label="Segunda paragem"
						onChange={handleSecond}
						placeholder="Pesquisar paragem..."
						value={secondStopId}
						w="100%"
						searchable
					/>
				)}
			</Section>

			<div className={styles.mapWrapper}>
				<MapView id="shapeMapView">
					<MapOverlayPatternShape
						id="pattern-shape"
						lineColor={lineColor}
						lineData={lineData as never}
						stopsData={{ features: [], type: 'FeatureCollection' }}
					/>
				</MapView>
			</div>
		</div>
	);

	//
}
