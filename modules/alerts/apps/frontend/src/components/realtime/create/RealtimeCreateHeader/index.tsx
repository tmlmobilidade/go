'use client';

/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeCreateHeader() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create.header' });

	//
	// C. Render components

	return (
		<Toolbar>
			{!realtimeCreateContext.flags.isFirst && <BackButton onClick={() => realtimeCreateContext.actions.prevStep()} />}
			<Tag label={t('create_alert')} variant="primary" />
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
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// C. Render components

	if (!isTripStep) return null;

	return (
		<Button
			disabled={realtimeCreateContext.data.selectedRides.length === 0}
			label={tGlobal('next')}
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
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// C. Render components

	if (!realtimeCreateContext.flags.isLast) return null;

	return (
		<Button
			disabled={!realtimeCreateContext.flags.canSave || realtimeCreateContext.flags.isSaving}
			label={tGlobal('save')}
			loading={realtimeCreateContext.flags.isSaving}
			onClick={() => realtimeCreateContext.actions.saveAlert()}
			variant="primary"
		/>
	);
}
