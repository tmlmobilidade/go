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
			{!realtimeDetailContext.flags.isLast && !realtimeDetailContext.flags.isFirst && <Button label="Seguinte" onClick={() => realtimeDetailContext.actions.nextStep()} variant="primary" />}
			{realtimeDetailContext.flags.isLast && <Button label="Salvar" variant="primary" />}
		</Toolbar>
	);

	//
}
