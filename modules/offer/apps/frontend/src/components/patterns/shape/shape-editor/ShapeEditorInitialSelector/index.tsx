'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Stop } from '@tmlmobilidade/types';
import { MapOverlayPatternShape, MapView, Section, Select, Text, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useState } from 'react';

import styles from '../ShapeEditorContent/styles.module.css';

/* * */

interface InitialStopSelectorProps {
	isLoading: boolean
	lineColor: string | undefined
	lineData: unknown
	onInitialize: (firstStop: Stop, secondStop: Stop) => void
	stopOptions: { label: string, value: string }[]
}

/* * */

export function InitialStopSelector({ isLoading, lineColor, lineData, onInitialize, stopOptions }: InitialStopSelectorProps) {
	//

	//
	// A. Setup variables

	const [firstStopId, setFirstStopId] = useState<null | string>(null);
	const [firstStop, setFirstStop] = useState<null | Stop>(null);
	const [secondStopId, setSecondStopId] = useState<null | string>(null);

	//
	// B. Handle actions

	const handleFirst = async (id: null | string) => {
		setFirstStopId(id);
		setFirstStop(null);
		setSecondStopId(null);
		if (!id) return;

		const selectedStopResult = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(id));
		if (!selectedStopResult.isOk) {
			useToast.error({ message: selectedStopResult.error, title: 'Erro ao carregar paragem' });
			return;
		}

		setFirstStop(selectedStopResult.data);
	};

	const handleSecond = async (id: null | string) => {
		setSecondStopId(id);
		if (!id || !firstStop) return;

		const selectedStopResult = await fetchData<Stop>(API_ROUTES.stops.STOPS_DETAIL(id));
		if (!selectedStopResult.isOk) {
			useToast.error({ message: selectedStopResult.error, title: 'Erro ao carregar paragem' });
			return;
		}

		onInitialize(firstStop, selectedStopResult.data);
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
					onChange={id => void handleFirst(id)}
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
						onChange={id => void handleSecond(id)}
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
