'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PatternsDetail, PatternsDetailSchema, PatternsImportGtfsRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { Button, closeModal, Divider, fetchApiData, Grid, Section, Text, useToast } from '@tmlmobilidade/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();

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
			if (result.error || !result.data) throw new Error(result.error || t('patterns:detail.GtfsStepConfirmation.import_error'));
			onLoad(PatternsDetailSchema.parse(result.data));
			closeModal(modalId);
		} catch (error) {
			if (mounted.current && !controller.signal.aborted) {
				useToast.error({ message: error instanceof Error ? error.message : t('patterns:detail.GtfsStepConfirmation.import_error') });
			}
		} finally {
			if (request.current === controller) request.current = null;
			if (mounted.current) setIsImporting(false);
		}
	};

	return (
		<Section gap="md">
			<Text>{t('patterns:detail.GtfsStepConfirmation.import_confirmation')}</Text>
			<Divider />
			<div>
				<Text fw={700}>{t('patterns:detail.GtfsStepConfirmation.before_import')}</Text>
				<Text>{t('patterns:detail.GtfsStepConfirmation.stops_label')}{' '}{currentStopCount}</Text>
				<Text>{t('patterns:detail.GtfsStepConfirmation.shape_label')}{' '}{currentShapeExtension} {t('patterns:detail.GtfsStepConfirmation.meters')}</Text>
			</div>
			<Divider />
			<div>
				<Text fw={700}>{t('patterns:detail.GtfsStepConfirmation.after_import')}</Text>
				<Text>{t('patterns:detail.GtfsStepConfirmation.stops_label')}{' '}{newStopCount}</Text>
				<Text>{t('patterns:detail.GtfsStepConfirmation.shape_label')}{' '}{Math.round(newShapeExtension)} {t('patterns:detail.GtfsStepConfirmation.meters')}</Text>
			</div>
			<Divider />
			<Grid columns="ab" gap="sm">
				<Button color="gray" label={t('patterns:detail.GtfsStepConfirmation.back')} onClick={onBack} variant="danger" />
				<Button label={t('patterns:detail.GtfsStepConfirmation.import')} loading={isImporting} onClick={handleConfirmImport} variant="primary" />
			</Grid>
		</Section>
	);

	//
}
