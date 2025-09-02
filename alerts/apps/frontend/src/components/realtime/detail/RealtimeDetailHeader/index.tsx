'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetailHeader() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// C. Render components

	return (
		<Toolbar>
			{!realtimeDetailContext.flags.isFirst && <BackButton onClick={() => realtimeDetailContext.actions.prevStep()} />}
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

	const realtimeDetailContext = useRealtimeDetailContext();
	const isTripStep = realtimeDetailContext.flags.currentIndex === realtimeDetailContext.data.steps.findIndex(step => step.id === 'trip');

	//
	// C. Render components

	if (!isTripStep) return null;

	return (
		<Button
			disabled={realtimeDetailContext.data.selectedRides.length === 0}
			label="Seguinte"
			onClick={() => realtimeDetailContext.actions.nextStep()}
			variant="primary"
		/>
	);
}

function SaveButton() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// C. Render components

	if (!realtimeDetailContext.flags.isLast) return null;

	return (
		<Button
			label="Salvar"
			loading={realtimeDetailContext.flags.isSaving}
			onClick={() => realtimeDetailContext.actions.saveAlert()}
			variant="primary"
		/>
	);
}
