'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { Translations } from '@/lib/translations';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

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
	const isTripStep = realtimeCreateContext.flags.currentIndex === realtimeCreateContext.data.steps.findIndex(step => step.id === 'trip');

	//
	// C. Render components

	if (!isTripStep) return null;

	return (
		<Button
			disabled={realtimeCreateContext.data.selectedRides.length === 0}
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
