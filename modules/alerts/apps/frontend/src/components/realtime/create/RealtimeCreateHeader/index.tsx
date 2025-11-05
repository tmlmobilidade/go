'use client';

/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@go/ui';

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
			{!realtimeCreateContext.flags.isFirst && <BackButton onClick={() => realtimeCreateContext.actions.prevStep()} />}
			<Tag label="Criar alerta" variant="primary" />
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
			disabled={realtimeCreateContext.flags.isSaving}
			label="Salvar"
			loading={realtimeCreateContext.flags.isSaving}
			onClick={() => realtimeCreateContext.actions.saveAlert()}
			variant="primary"
		/>
	);
}
