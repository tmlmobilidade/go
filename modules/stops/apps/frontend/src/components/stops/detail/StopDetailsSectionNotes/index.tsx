'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, Grid, Section, Textarea } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionNotes() {
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
				<Grid>
					<Textarea
						key={stopDetailContext.data.form.key('comments')}
						minRows={10}
						placeholder="Construção planeada a..."
						readOnly={stopDetailContext.flags.isReadOnly}
						autosize
						{...stopDetailContext.data.form.getInputProps('comments')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
