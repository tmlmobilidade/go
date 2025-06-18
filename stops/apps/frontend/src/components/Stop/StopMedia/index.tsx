'use client';

import { Collapsible, Section } from '@tmlmobilidade/ui';

import { UploadFile } from './UploadFile';
import { UploadImage } from './UploadImage';

/* * */

export function StopMedia() {
	//

	//
	// A. Render components
	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens & Vídeos"
		>
			<Section gap="md">
				<UploadImage
					onDelete={() => console.log('Image Deleted!')}
				/>
				<UploadFile
					onDelete={() => console.log('File Deleted!')}
				/>
			</Section>
		</Collapsible>
	);
}
