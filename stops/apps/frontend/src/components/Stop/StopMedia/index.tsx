'use client';

import { Button, Collapsible, FileButton, Grid, Section, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';

import { UploadImage } from './UploadImage';

export default function StopMedia({ data }) {
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
				{/* <Grid columns="abcd" gap="md">
					{stopDetailContext.data.form.getValues().file_ids.map(file_id => <div key={file_id}>{file_id}</div>)}
				</Grid>

				<Grid columns="abcd" gap="md">
					{stopDetailContext.data.form.getValues().image_ids.map(image_id => <div key={image_id}>{image_id}</div>)}
				</Grid> */}

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
