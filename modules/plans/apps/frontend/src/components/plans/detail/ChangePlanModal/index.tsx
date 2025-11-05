'use client';

/* * */

import { ChangePlanContextProvider, useChangePlanContext } from '@/contexts/ChangePlan.context';
import { IconRefresh } from '@tabler/icons-react';
import { type Plan } from '@go/types';
import { Button, closeModal, Combobox, Divider, Grid, Label, MeContextProvider, openModal, Section, Tag, Text } from '@go/ui';
import { Dates } from '@go/utils-dates';

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
					value={changePlanContext.data.selectedValidation?._id}
					data={changePlanContext.data.availableValidations.map(item => ({
						icon: <Tag label={item._id} variant="secondary" />,
						label: Dates.fromUnixTimestamp(item.created_at).setZone('Europe/Lisbon', 'offset_only').toLocaleString({ day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'long', year: 'numeric' }, 'pt-PT'),
						value: item._id,
					}))}
					onChange={(value) => {
						changePlanContext.actions.setSelectedValidation(value);
					}}
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
						disabled={!changePlanContext.data.selectedValidation}
						icon={<IconRefresh />}
						label="Alterar Plano"
						loading={changePlanContext.flags.loading}
						onClick={changePlanContext.actions.confirmChange}
					/>
				</Grid>
			</Section>

		</div>
	);

	//
}
