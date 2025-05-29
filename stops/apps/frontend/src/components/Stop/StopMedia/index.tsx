'use client';

import { Collapsible, Section } from '@tmlmobilidade/ui';

import { UploadFile } from './UploadFile';
import { UploadImage } from './UploadImage';

/* * */

export function StopMedia({ actions, data }) {
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
					actions={actions}
					data={data}
					// imageUrl={stopDetailContext.data.imageUrl}
					// imageUrl="image.png"
					// label="Imagem"
					onDelete={() => alert('Image deleted!')}
					// onDelete={stopDetailContext.actions.deleteImage}
					// onFileChange={() => alert('File changed!')}
				/>
				<UploadFile
					actions={actions}
					data={data}
					// imageUrl={stopDetailContext.data.imageUrl}
					// imageUrl="image.png"
					// label="Imagem"
					onDelete={() => alert('File deleted!')}
					// onDelete={stopDetailContext.actions.deleteImage}
					// onFileChange={() => alert('File changed!')}
				/>
			</Section>
		</Collapsible>
	);
}
