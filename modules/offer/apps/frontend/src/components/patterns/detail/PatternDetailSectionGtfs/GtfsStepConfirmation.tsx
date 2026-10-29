'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PatternsDetail, PatternsDetailSchema, PatternsImportGtfsRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { Button, closeModal, Divider, fetchApiData, Grid, Section, Text, useToast } from '@tmlmobilidade/ui';
import { useEffect, useRef, useState } from 'react';

import { GtfsTrip } from './GtfsImport.modal';

/* * */

interface GtfsStepConfirmationProps {
	currentShapeExtension: number
	currentStopCount: number
	modalId: string
	onBack: () => void
	onLoad: (pattern: PatternsDetail) => void
	patternId: string
	selectedTrip: GtfsTrip
}

/* * */

export function GtfsStepConfirmation({ currentShapeExtension, currentStopCount, modalId, onBack, onLoad, patternId, selectedTrip }: GtfsStepConfirmationProps) {
	//

	const [isImporting, setIsImporting] = useState(false);
	const mounted = useRef(true);
	const request = useRef<AbortController | null>(null);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			request.current?.abort();
		};
	}, []);

	const newStopCount = selectedTrip.path.length;
	const newShapeExtension = selectedTrip.shape.points[selectedTrip.shape.points.length - 1]?.shape_dist_traveled || 0;

	const handleConfirmImport = async () => {
		if (request.current || !mounted.current) return;
		const controller = new AbortController();
		request.current = controller;
		setIsImporting(true);
		try {
			const result = await fetchApiData<PatternsDetail>({
				body: PatternsImportGtfsRequestSchema.parse({ path: selectedTrip.path, shape: selectedTrip.shape.points }),
				method: 'POST',
				options: { signal: controller.signal },
				url: API_ROUTES.offer.PATTERNS_DETAIL_IMPORT_GTFS(patternId),
			});
			if (!mounted.current || controller.signal.aborted) return;
			if (result.error || !result.data) throw new Error(result.error || 'No import preview returned');
			onLoad(PatternsDetailSchema.parse(result.data));
			closeModal(modalId);
		} catch (error) {
			if (mounted.current && !controller.signal.aborted) {
				useToast.error({ message: error instanceof Error ? error.message : 'Erro ao importar percurso' });
			}
		} finally {
			if (request.current === controller) request.current = null;
			if (mounted.current) setIsImporting(false);
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
