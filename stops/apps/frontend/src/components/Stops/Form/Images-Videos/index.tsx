'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Collapsible, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function ImagesVideos() {
	//

	//
	// A. Setup variables

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens & Vídeos"
		>
			<Section>
				<Text>NS</Text>
			</Section>

		</Collapsible>
	);

	//
}
