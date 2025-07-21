'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Collapsible, Section, Textarea } from '@tmlmobilidade/ui';

/* * */

export function NotesComments() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Notas e Comentários"
		>
			<Section>
				<Textarea
					mih="100px"
					miw="100%"
					placeholder="Construção planeada a..."
					{...stopDetailContext.data.form.getInputProps('comments')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
