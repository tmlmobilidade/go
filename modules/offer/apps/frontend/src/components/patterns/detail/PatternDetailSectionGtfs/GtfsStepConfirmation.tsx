'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Pattern } from '@tmlmobilidade/types';
import { Button, closeModal, Divider, Grid, Section, Text, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useState } from 'react';

import { GtfsTrip } from './GtfsImport.modal';

/* * */

interface GtfsStepConfirmationProps {
	currentShapeExtension: number
	currentStopCount: number
	modalId: string
	onBack: () => void
	onLoad: (pattern: Pattern) => void
	patternId: string
	selectedTrip: GtfsTrip
}

/* * */

export function GtfsStepConfirmation({ currentShapeExtension, currentStopCount, modalId, onBack, onLoad, patternId, selectedTrip }: GtfsStepConfirmationProps) {
	//

	const [isImporting, setIsImporting] = useState(false);

	const newStopCount = selectedTrip.path.length;
	const newShapeExtension = selectedTrip.shape.points[selectedTrip.shape.points.length - 1]?.shape_dist_traveled || 0;

	const handleConfirmImport = async () => {
		try {
			setIsImporting(true);
			const result = await fetchData<Pattern>(
				API_ROUTES.offer.PATTERNS_DETAIL_IMPORT_GTFS(patternId),
				'POST',
				{
					path: selectedTrip.path,
					shape: selectedTrip.shape.points,
				},
			);
			if (result.error) {
				useToast.error({ message: result.error });
				setIsImporting(false);
				return;
			}
			closeModal(modalId);
			onLoad(result.data as Pattern);
		} catch (error) {
			console.log(error);
			useToast.error({ message: 'Erro ao importar percurso' });
			setIsImporting(false);
		}
	};

	return (
		<Section gap="md">
			<Text>Tem a certeza que pretende importar este percurso?</Text>
			<Divider />
			<div>
				<Text fw={700}>COMO ESTÁ AGORA</Text>
				<Text>Paragens: {currentStopCount}</Text>
				<Text>Shape: {currentShapeExtension} metros</Text>
			</div>
			<Divider />
			<div>
				<Text fw={700}>COMO VAI FICAR DEPOIS DE IMPORTAR</Text>
				<Text>Paragens: {newStopCount}</Text>
				<Text>Shape: {Math.round(newShapeExtension)} metros</Text>
			</div>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button color="gray" label="Voltar" onClick={onBack} variant="danger" />
				<Button label="Importar" loading={isImporting} onClick={handleConfirmImport} variant="primary" />
			</Grid>
		</Section>
	);

	//
}
