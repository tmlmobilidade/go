'use client';

/* * */

import { ChangePlanContextProvider, useChangePlanContext } from '@/contexts/ChangePlan.context';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { type Plan } from '@tmlmobilidade/types';
import { Button, closeModal, Combobox, Divider, Grid, Label, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';

/* * */

export const CHANGE_PLAN_MODAL_ID = 'change-plan-modal';

/* * */

export const openChangePlanModal = (plan?: Plan) => {
	openModal({
		children: (
			<MeContextProvider>
				<ChangePlanContextProvider plan={plan}>
					<ChangePlanModal />
				</ChangePlanContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CHANGE_PLAN_MODAL_ID,
		padding: 0,
		size: 'auto',
		styles: { content: { overflow: 'unset' } },
		withCloseButton: false,
	});
};

/* * */

export default function ChangePlanModal() {
	//

	//
	// A. Setup variables

	const changePlanContext = useChangePlanContext();

	//
	// B. Render Components

	return (
		<div style={{ minHeight: '200px' }}>
			<Section>
				<Label size="lg" caps>Alterar Plano</Label>
				<Text>Selecione o plano prentendido da lista de planos validados.</Text>
			</Section>

			<Divider />

			<Section>
				<Combobox
					placeholder="Selecione o plano"
					data={changePlanContext.data.available.map(item => ({
						label: item._id,
						value: item._id,
					}))}
					fullWidth
				/>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={changePlanContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CHANGE_PLAN_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						icon={<IconRosetteDiscountCheckFilled />}
						label="Aprovar Plano"
						loading={changePlanContext.flags.loading}
						onClick={changePlanContext.actions.confirmChange}
					/>
				</Grid>
			</Section>

		</div>
	);

	//
}
