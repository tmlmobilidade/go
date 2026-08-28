/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { PlansCreateContextProvider, usePlansCreateContext } from '@/contexts/PlansCreateForm.context';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { AgencyTag, Button, closeModal, Divider, Grid, Label, MeContextProvider, openModal, ProcessingStatusDisplay, Section, ValidityStatusDisplay } from '@tmlmobilidade/ui';

import { useGtfsValidationsAgenciesData } from '../../shared/use-gtfs-validations-agencies-data';

/* * */

export const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

/* * */

export const openApprovePlanModal = (validation_id?: string) => {
	openModal({
		children: (
			<MeContextProvider>
				<PlansCreateContextProvider validationId={validation_id}>
					<ApprovePlanModal />
				</PlansCreateContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_PLAN_MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export default function ApprovePlanModal() {
	//

	//
	// A. Setup variables

	const plansCreateContext = usePlansCreateContext();

	const { data: agenciesData } = useGtfsValidationsAgenciesData({
		permissions: { actions: ['read'], scope: 'gtfs_validations' },
	});

	//
	// B. Render components

	return (
		<>

			<Section alignItems="center" flexDirection="row" gap="lg">
				<ProcessingStatusDisplay value={plansCreateContext.data.validation.processing_status} />
				<ValidityStatusDisplay value={plansCreateContext.data.validation.validity_status} />
				<AgencyTag
					agencyId={plansCreateContext.data.validation?.agency_id}
					data={agenciesData}
					showShortName
				/>
				<Label size="md" caps>{plansCreateContext.data.validation._id}</Label>
			</Section>

			<Divider />

			{plansCreateContext.data.validation.gtfs_agency && (
				<>
					<Section gap="sm">
						<Label size="lg">agency.txt</Label>
						<AgencyDisplay data={plansCreateContext.data.validation.gtfs_agency} />
					</Section>
					<Divider />
				</>
			)}

			{plansCreateContext.data.validation.gtfs_feed_info && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<FeedInfoDisplay data={plansCreateContext.data.validation.gtfs_feed_info} />
					</Section>
					<Divider />
				</>
			)}

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={plansCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_PLAN_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						icon={<IconRosetteDiscountCheckFilled />}
						label="Aprovar Plano"
						loading={plansCreateContext.flags.loading}
						onClick={plansCreateContext.actions.createPlan}
					/>
				</Grid>
			</Section>

		</>
	);
}
