'use client';

import { type GtfsTrip } from '@/components/patterns/detail/PatternDetailSectionGtfs/index';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Pattern } from '@tmlmobilidade/types';
import { Button, closeModal, Divider, Grid, openModal, Section, Text, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useState } from 'react';

/* * */

const MODAL_ID = 'gtfs-import-confirmation-modal';

/* * */

interface GtfsImportConfirmationProps {
	currentShapeExtension: number
	currentStopCount: number
	onSuccess: () => void
	patternId: string
	selectedTrip: GtfsTrip
}

/* * */

function GtfsImportConfirmation({ currentShapeExtension, currentStopCount, onSuccess, patternId, selectedTrip }: GtfsImportConfirmationProps) {
	//

	//
	// A. Setup variables

	const [isImporting, setIsImporting] = useState(false);
	const newStopCount = selectedTrip.path.length;
	const newShapeExtension = selectedTrip.shape.points[selectedTrip.shape.points.length - 1]?.shape_dist_traveled || 0;

	//
	// B. Handle actions

	const handleConfirmImport = async () => {
		try {
			setIsImporting(true);

			// Import the pattern from GTFS
			const result = await fetchData<Pattern>(
				API_ROUTES.offer.PATTERNS_DETAIL_IMPORT_GTFS(patternId),
				'POST',
				{
					path: selectedTrip.path,
					shape: selectedTrip.shape.points,
				},
			);

			// Check for API error
			if (result.error) {
				useToast.error({ message: result.error });
				setIsImporting(false);
				return;
			}

			// Close modal and trigger success callback
			closeGtfsImportConfirmationModal();
			useToast.success({ message: 'Percurso importado com sucesso' });
			onSuccess();
		} catch (error) {
			console.log(error);
			useToast.error({ message: 'Erro ao importar percurso' });
			setIsImporting(false);
		}
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Text>Tem a certeza que pretende importar este pattern?</Text>
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
				<Button color="gray" label="Cancelar" onClick={closeGtfsImportConfirmationModal} variant="danger" />
				<Button label="Substituir percurso e shape" loading={isImporting} onClick={handleConfirmImport} variant="primary" />
			</Grid>
		</Section>
	);

	//
}

/* * */

export const openGtfsImportConfirmationModal = (props: GtfsImportConfirmationProps) => {
	openModal({
		children: <GtfsImportConfirmation {...props} />,
		modalId: MODAL_ID,
		size: 'lg',
		title: 'Substituir percurso e shape?',
	});
};

/* * */

export const closeGtfsImportConfirmationModal = () => {
	closeModal(MODAL_ID);
};
