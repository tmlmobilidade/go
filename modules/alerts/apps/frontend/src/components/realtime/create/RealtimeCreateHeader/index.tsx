'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateHeader() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>

			<Tag label="Causa" onClick={() => realtimeCreateContext.actions.goToStep(0)} variant={realtimeCreateContext.data.currentStep.id === 'cause' ? 'primary' : 'secondary'} filled />
			<Tag label="Efeito" onClick={() => realtimeCreateContext.actions.goToStep(1)} variant={realtimeCreateContext.data.currentStep.id === 'effect' ? 'primary' : 'secondary'} filled />
			<Tag label="Circulações" onClick={() => realtimeCreateContext.actions.goToStep(2)} variant={realtimeCreateContext.data.currentStep.id === 'trip' ? 'primary' : 'secondary'} filled />
			<Tag label="Resumo" onClick={() => realtimeCreateContext.actions.goToStep(3)} variant={realtimeCreateContext.data.currentStep.id === 'summary' ? 'primary' : 'secondary'} filled />

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
