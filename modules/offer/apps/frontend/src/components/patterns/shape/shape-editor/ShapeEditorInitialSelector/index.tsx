'use client';

/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { MapOverlayPatternShape, MapView, Section, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../ShapeEditorContent/styles.module.css';

import { ShapeEditorStopSelect } from '../ShapeEditorStopSelect';

/* * */

interface InitialStopSelectorProps {
	isLoading: boolean
	lineColor: string | undefined
	lineData: unknown
	onInitialize: (firstStop: Stop, secondStop: Stop) => void
}

/* * */

export function InitialStopSelector({ isLoading, lineColor, lineData, onInitialize }: InitialStopSelectorProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [firstStop, setFirstStop] = useState<null | Stop>(null);

	//
	// B. Handle actions

	const handleFirst = (stop: null | Stop) => {
		setFirstStop(stop);
	};

	const handleSecond = (stop: null | Stop) => {
		if (!stop || !firstStop) return;
		onInitialize(firstStop, stop);
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Section gap="md" width="30%">
				<Text size="xl" weight="semibold">{t('patterns:shape.InitialStopSelector.stop_sequence')}</Text>
				<Text>{t('patterns:shape.InitialStopSelector.initial_stops_hint')}</Text>
				<ShapeEditorStopSelect
					disabled={isLoading}
					label={t('patterns:shape.InitialStopSelector.first_stop')}
					onChange={handleFirst}
					value={firstStop}
				/>
				{firstStop && (
					<ShapeEditorStopSelect
						disabled={isLoading}
						excludeStopIds={[firstStop._id]}
						label={t('patterns:shape.InitialStopSelector.second_stop')}
						onChange={handleSecond}
						value={null}
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
