/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { StatusTag } from '@/components/common/StatusTag';
import { PlansCreateContextProvider, usePlansCreateContext } from '@/contexts/PlansCreate.context';
import { Button, closeModal, Divider, Grid, Label, openModal, Section, Tag } from '@tmlmobilidade/ui';

/* * */

export const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

/* * */

export const openConvertToPlanModalModal = (validation_id?: string) => {
	openModal({
		children: (
			<PlansCreateContextProvider validationId={validation_id}>
				<ConvertToPlanModalModal />
			</PlansCreateContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_PLAN_MODAL_ID,
		padding: 0,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function ConvertToPlanModalModal() {
	//

	//
	// A. Setup variables

	const plansCreateContext = usePlansCreateContext();

	//
	// B. Render components

	return (
		<>

			<Section alignItems="center" flexDirection="row" gap="lg">
				<StatusTag status={plansCreateContext.data.validation.feeder_status} />
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
						label="Cancelar"
						onClick={() => closeModal(CREATE_PLAN_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						label="Converter em Plano"
						loading={plansCreateContext.flags.loading}
						onClick={plansCreateContext.actions.createPlan}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
