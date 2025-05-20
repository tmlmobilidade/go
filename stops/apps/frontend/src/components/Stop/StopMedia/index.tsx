'use client';

import { Button, Collapsible, FileButton, Grid, Section, useToast } from '@tmlmobilidade/ui';

import { UploadImage } from './UploadImage';

export function StopMedia({ data }) {
	//

	//
	// A. Setup variables

	// const [file, setFile] = useState<File | null>(null);

	//
	// B. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens & Vídeos"
		>
			<Section gap="md">
				<UploadImage
					data={data}
					// imageUrl={stopDetailContext.data.imageUrl}
					// imageUrl="image.png"
					// label="Imagem"
					// onDelete={() => alert('Image deleted!')}
					// onDelete={stopDetailContext.actions.deleteImage}
					// onFileChange={() => alert('File changed!')}
				/>
			</Section>
		</Collapsible>
	);
}
