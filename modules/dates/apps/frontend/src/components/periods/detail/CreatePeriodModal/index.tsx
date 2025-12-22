'use client';

/* * */

import { AgencySelect } from '@/components/common/AgencySelect';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { PeriodsCreateContextProvider, usePeriodsCreateContext } from '@/contexts/PeriodsCreate.context';
import { PeriodSchema } from '@tmlmobilidade/types';
import { Button, closeModal, ColorInput, Divider, Grid, Label, MeContextProvider, openModal, Section, Text, TextInput } from '@tmlmobilidade/ui';

/* * */

export const CREATE_PERIOD_MODAL_ID = 'create-period-modal';

/* * */

export const openCreatePeriodModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<AgenciesContextProvider>
					<PeriodsCreateContextProvider>
						<CreatePeriodModal />
					</PeriodsCreateContextProvider>
				</AgenciesContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_PERIOD_MODAL_ID,
		padding: 0,
		size: 'lg',
		withCloseButton: false,
	});
};

/* * */

export default function CreatePeriodModal() {
	//

	//
	// A. Setup variables

	const periodsCreateContext = usePeriodsCreateContext();

	//
	// B. Render Components

	return (
		<>

			<Section gap="xs">
				<Label size="lg" caps>Novo Período</Label>
				<Text size="sm">Crie um período para definir intervalos de datas operacionais.</Text>
			</Section>

			<Divider />

			<Section gap="md">
				<TextInput
					label="Nome"
					placeholder="Ex: Período Escolar 2024/2025"
					required={!PeriodSchema.shape.name.isOptional()}
					w="100%"
					{...periodsCreateContext.data.form.getInputProps('name')}
				/>

				<AgencySelect
					label="Operador"
					required={!PeriodSchema.shape.agency_id.isOptional()}
					value={periodsCreateContext.data.form.values.agency_id || ''}
					{...periodsCreateContext.data.form.getInputProps('agency_id')}
				/>

				<ColorInput
					label="Cor"
					required={!PeriodSchema.shape.color.isOptional()}
					withEyeDropper={false}
					{...periodsCreateContext.data.form.getInputProps('color')}
				/>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={periodsCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_PERIOD_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						disabled={periodsCreateContext.flags.loading || !periodsCreateContext.data.form.isValid()}
						label="Criar Período"
						loading={periodsCreateContext.flags.loading}
						onClick={periodsCreateContext.actions.createPeriod}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
