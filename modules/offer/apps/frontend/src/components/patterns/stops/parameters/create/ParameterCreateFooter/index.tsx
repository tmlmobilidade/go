'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/stops/parameters/create/ParameterCreate.context';
import { closeCreateParameterModal } from '@/components/patterns/stops/parameters/create/ParameterCreate.modal';
import { IconClock } from '@tabler/icons-react';
import { Button, Section, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ParameterCreateFooter() {
	//

	//
	// A. Setup variables

	const parameterCreateContext = useParameterCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>

			<Section alignItems="center" flexDirection="row" padding="none">
				<IconClock size={20} />
				<Button
					c="var(--color-system-text-100)"
					label={`Esta viagem demora aproximadamente ${parameterCreateContext.data.parameterForUI.travelTimes.totalTripSecondsWithStops.formatted}`}
					style={{ textDecoration: 'underline' }}
					variant="transparent"
				/>
			</Section>

			<Button label="Cancelar" onClick={closeCreateParameterModal} variant="danger" />
			<Button
				disabled={!parameterCreateContext.data.form.isValid()}
				label={parameterCreateContext.flags.isEditing ? 'Editar' : 'Criar'}
				onClick={parameterCreateContext.actions.submitParameter}
			/>

		</Toolbar>
	);

	//
}
