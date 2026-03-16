/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { PlansCreateContextProvider, usePlansCreateContext } from '@/contexts/PlansCreate.context';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { Button, closeModal, Divider, Grid, Label, openModal, ProcessingStatusTag, Section, Tag, ValidityStatusTag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

/* * */

export const openApprovePlanModal = (validation_id?: string) => {
	openModal({
		children: (
			<PlansCreateContextProvider validationId={validation_id}>
				<ApprovePlanModal />
			</PlansCreateContextProvider>
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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<>

			<Section alignItems="center" flexDirection="row" gap="lg">
				<ProcessingStatusTag value={plansCreateContext.data.validation.processing_status} />
				<ValidityStatusTag value={plansCreateContext.data.validation.validity_status} />
				<Tag label={plansCreateContext.data.validation?.gtfs_agency.agency_id} variant="secondary" />
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
						label={t('plans:validations.detail.ApprovePlanModal.actions.cancel.label')}
						onClick={() => closeModal(CREATE_PLAN_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						icon={<IconRosetteDiscountCheckFilled />}
						label={t('plans:validations.detail.ApprovePlanModal.actions.approve.label')}
						loading={plansCreateContext.flags.loading}
						onClick={plansCreateContext.actions.createPlan}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
