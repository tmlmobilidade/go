'use client';

/* * */

import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { Label, Section } from '@tmlmobilidade/ui';

/* * */

export function RidesDetailAcceptanceJustification() {
	//
	// A. Setup variables

	const { data: { acceptance } } = useRidesDetailAcceptanceContext();

	//
	// B. Render components

	if (!acceptance) return null;

	return (
		<Section>
			<Label size="lg" caps>Justificação</Label>
		</Section>
	);
}
