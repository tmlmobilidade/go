'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateHeader() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			{!realtimeCreateContext.flags.isFirst && <CloseButton onClick={realtimeCreateContext.actions.prevStep} />}
			<Label size="md" variant={realtimeCreateContext.flags.isFirst ? 'muted' : undefined} caps singleLine>Novo Alerta</Label>
			<Spacer />
			<TripNextButton />
			<SaveButton />
		</Toolbar>
	);

	//
}

function TripNextButton() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// C. Render components

	if (realtimeCreateContext.data.currentStep.id !== 'trip') return null;

	return (
		<Button
			label="Seguinte"
			onClick={() => realtimeCreateContext.actions.nextStep()}
			variant="primary"
		/>
	);
}

function SaveButton() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// C. Render components

	if (!realtimeCreateContext.flags.isLast) return null;

	return (
		<Button
			disabled={!realtimeCreateContext.flags.canSave || realtimeCreateContext.flags.isCreating}
			label="Salvar"
			loading={realtimeCreateContext.flags.isCreating}
			onClick={realtimeCreateContext.actions.create}
			variant="primary"
		/>
	);
}
