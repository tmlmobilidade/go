import { PlanDetailContextProvider, PlanDetailMode, usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { useValidationListContext, ValidationListContextProvider } from '@/contexts/ValidationList.context';
import { Validation } from '@tmlmobilidade/types';
import { Button, closeModal, Combobox, Divider, Grid, Label, openModal, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useEffect, useState } from 'react';

/* * */

const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

export const OpenCreatePlanModal = () => {
	openModal({
		children: (
			<PlanDetailContextProvider planId={PlanDetailMode.NEW}>
				<ValidationListContextProvider>
					<CreatePlanModal />
				</ValidationListContextProvider>
			</PlanDetailContextProvider>
		),
		modalId: CREATE_PLAN_MODAL_ID,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export default function CreatePlanModal() {
	// A. State Management
	const [selectedValidation, setSelectedValidation] = useState<null | Validation>(null);
	const planDetailContext = usePlanDetailContext();
	const validationListContext = useValidationListContext();

	//
	// B. Transform data

	// Only show success validations
	useEffect(() => {
		validationListContext.actions.setStatus('success');
	}, []);

	//
	// C. Render

	const renderFeedInfoSection = () => {
		return (
			<Section gap="sm" padding="none">
				<Label>Agência</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>ID</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_id ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Nome</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Telefone</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_phone ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{selectedValidation?.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
				<Divider />
				<Label>Feed Info</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>Data de início</Label>
						<Text size="base">{selectedValidation ? Dates.fromUnixTimestamp(selectedValidation.gtfs_feed_info.feed_start_date).toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR) : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{selectedValidation ? Dates.fromUnixTimestamp(selectedValidation.gtfs_feed_info.feed_end_date).toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR) : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Linguagem do feed</Label>
						<Text size="base">{selectedValidation?.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{selectedValidation?.gtfs_feed_info.feed_contact_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{selectedValidation?.gtfs_feed_info.feed_contact_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	const renderValidationSelection = () => {
		return (
			<div style={{ width: '100%', zIndex: 1000 }}>

				<Combobox
					label="Selecione uma validação"
					onChange={value => setSelectedValidation(validationListContext.data.filtered.find(validation => validation._id === value) ?? null)}
					data={validationListContext.data.filtered.map(validation => ({
						label: `${validation.feeder_status} - ${validation._id} - ${validation.gtfs_agency.agency_name} | ${Dates.fromUnixTimestamp(validation.gtfs_feed_info.feed_start_date).toLocaleString(Dates.FORMATS.DATE_SHORT)} - ${Dates.fromUnixTimestamp(validation.gtfs_feed_info.feed_end_date).toLocaleString(Dates.FORMATS.DATE_SHORT)}`,
						value: validation._id,
					}))}
					clearable
					// searchable
				/>
			</div>
		);
	};

	const renderActionButtons = () => (
		<Grid columns="ab" gap="md">
			<Button label="Cancelar" onClick={() => closeModal(CREATE_PLAN_MODAL_ID)} variant="danger" fullWidth />
			<Button
				disabled={!planDetailContext.flags.canSave || planDetailContext.flags.isSaving}
				label="Criar plano"
				loading={planDetailContext.flags.isSaving}
				onClick={planDetailContext.actions.savePlan}
				variant="primary"
				fullWidth
			/>
		</Grid>
	);

	return (
		<Section gap="lg" padding="lg">
			{renderFeedInfoSection()}
			{renderValidationSelection()}
			{renderActionButtons()}
		</Section>
	);
}

/* * */
