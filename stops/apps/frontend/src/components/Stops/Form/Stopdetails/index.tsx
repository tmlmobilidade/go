'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Collapsible, Pane, PanesManager, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetails() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Pane>
			<Collapsible
				description="Detalhes desta Paragem"
				title="Informações gerais sobre esta paragem."
			>
				<Section gap="md">
					<TextInput
						label="Código Único da Paragem"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('id')}

					/>
				</Section>

			</Collapsible>
		</Pane>
	);

	//
}
