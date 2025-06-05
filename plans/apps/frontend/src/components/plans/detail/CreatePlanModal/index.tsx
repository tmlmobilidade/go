import { useValidationListContext, ValidationListContextProvider } from '@/contexts/ValidationList.context';
import { Button, closeModal, Combobox, Divider, Grid, Label, openModal, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import { useCreatePlan } from './useCreatePlan';

/* * */

const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

export const OpenCreatePlanModal = () => {
	openModal({
		children: (
			<ValidationListContextProvider>
				<CreatePlanModal />
			</ValidationListContextProvider>
		),
		modalId: CREATE_PLAN_MODAL_ID,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export default function CreatePlanModal() {
	const validationListContext = useValidationListContext();
	const { actions, data, flags } = useCreatePlan(validationListContext.data.raw);

	const renderFeedInfoSection = () => {
		return (
			<Section gap="sm" padding="none">
				<Label>Agência</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>ID</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_id ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Nome</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Telefone</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_phone ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL</Label>
						<Text size="base">{data.selectedValidation?.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
				<Divider />
				<Label>Feed Info</Label>
				<Grid columns="abc" gap="md">
					<Section padding="none">
						<Label size="sm" caps>Data de início</Label>
						<Text size="base">{data.selectedValidation ? Dates.fromUnixTimestamp(data.selectedValidation.gtfs_feed_info.feed_start_date).toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR) : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{data.selectedValidation ? Dates.fromUnixTimestamp(data.selectedValidation.gtfs_feed_info.feed_end_date).toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR) : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Linguagem do feed</Label>
						<Text size="base">{data.selectedValidation?.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{data.selectedValidation?.gtfs_feed_info.feed_contact_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{data.selectedValidation?.gtfs_feed_info.feed_contact_url ?? 'N/A'}</Text>
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
					onChange={(id: string) => actions.setSelectedValidation(id)}
					data={data.validations.map(validation => ({
						label: `${validation._id} - ${validation.gtfs_agency.agency_name} | ${Dates.fromUnixTimestamp(validation.gtfs_feed_info.feed_start_date).toLocaleString(Dates.FORMATS.DATE_SHORT)} - ${Dates.fromUnixTimestamp(validation.gtfs_feed_info.feed_end_date).toLocaleString(Dates.FORMATS.DATE_SHORT)}`,
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
				disabled={!flags.canCreatePlan}
				label="Criar plano"
				loading={flags.loading}
				onClick={actions.createPlan}
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
