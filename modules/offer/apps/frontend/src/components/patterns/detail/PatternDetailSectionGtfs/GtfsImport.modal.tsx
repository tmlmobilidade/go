'use client';

/* * */

import { GtfsStepConfirmation } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsStepConfirmation';
import { GtfsStepDropzone } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsStepDropzone';
import { GtfsStepSelection } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsStepSelection';
import { type Pattern } from '@tmlmobilidade/types';
import { openModal } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

const MODAL_ID = 'gtfs-import-modal';

/* * */

export interface GtfsTrip {
	path: {
		avg_speed: number
		dwell_time: number
		shape_dist_traveled: number
		stop_id: string
		stop_sequence: number
	}[]
	route_id: string
	shape: {
		points: {
			shape_dist_traveled: number
			shape_pt_lat: number
			shape_pt_lon: number
			shape_pt_sequence: number
		}[]
	}
	trip_headsign: string
	trip_id: string
}

export interface GtfsRoute {
	route_id: string
	trips: GtfsTrip[]
}

interface GtfsImportModalContentProps {
	currentShapeExtension: number
	currentStopCount: number
	onLoad: (pattern: Pattern) => void
	patternId: string
}

/* * */

function GtfsImportModalContent({ currentShapeExtension, currentStopCount, onLoad, patternId }: GtfsImportModalContentProps) {
	//

	const [step, setStep] = useState<'confirmation' | 'dropzone' | 'selection'>('dropzone');
	const [trips, setTrips] = useState<GtfsTrip[]>([]);
	const [selectedTrip, setSelectedTrip] = useState<GtfsTrip | null>(null);

	if (step === 'dropzone') {
		return (
			<GtfsStepDropzone
				onNext={(parsed) => {
					setTrips(parsed);
					setStep('selection');
				}}
			/>
		);
	}

	if (step === 'selection') {
		return (
			<GtfsStepSelection
				onBack={() => setStep('dropzone')}
				trips={trips}
				onNext={(trip) => {
					setSelectedTrip(trip);
					setStep('confirmation');
				}}
			/>
		);
	}

	return (
		<GtfsStepConfirmation
			currentShapeExtension={currentShapeExtension}
			currentStopCount={currentStopCount}
			modalId={MODAL_ID}
			onBack={() => setStep('selection')}
			onLoad={onLoad}
			patternId={patternId}
			selectedTrip={selectedTrip}
		/>
	);

	//
}

/* * */

interface OpenGtfsImportModalProps {
	currentShapeExtension: number
	currentStopCount: number
	onLoad: (pattern: Pattern) => void
	patternId: string
}

/* * */

export function openGtfsImportModal({ currentShapeExtension, currentStopCount, onLoad, patternId }: OpenGtfsImportModalProps) {
	openModal({
		children: (
			<GtfsImportModalContent
				currentShapeExtension={currentShapeExtension}
				currentStopCount={currentStopCount}
				onLoad={onLoad}
				patternId={patternId}
			/>
		),
		modalId: MODAL_ID,
		size: 'xl',
		title: 'Importar ficheiro GTFS',
	});
}
