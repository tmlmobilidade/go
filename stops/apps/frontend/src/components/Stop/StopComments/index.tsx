'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export default function StopComments() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//

	//
	// A. Render components

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Notas e Comentários"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="md">
					{stopDetailContext.data.form.getValues().comments.map((comment) => {
						return (
							<div key={comment._id}>
								<div>ID: {comment._id}</div>
								<div>USER ID: {comment.user_id}</div>
								<div>TEXT: {comment.text}</div>
							</div>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
