'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export default function Media() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens & Vídeos"
		>
			<Section gap="md">
				<Grid columns="abcd" gap="md">
					{stopDetailContext.data.form.getValues().file_ids.map(file_id => <div key={file_id}>{file_id}</div>)}
				</Grid>

				<Grid columns="abcd" gap="md">
					{stopDetailContext.data.form.getValues().image_ids.map(image_id => <div key={image_id}>{image_id}</div>)}
				</Grid>
			</Section>
		</Collapsible>
	);
}
