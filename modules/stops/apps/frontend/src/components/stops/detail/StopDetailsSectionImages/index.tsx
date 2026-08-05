'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, FileButton, Grid, ImageUpload, Section, useToast } from '@tmlmobilidade/ui';

/* * */

const MAX_STOP_IMAGES = 3;

/* * */

export function StopDetailsSectionImages() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const images = stopDetailContext.data.images ?? [];
	const remainingSlots = MAX_STOP_IMAGES - images.length;

	//
	// B. Handle actions

	const handleFilesChange = (files: File[]) => {
		if (files.length > remainingSlots) {
			useToast.error({ message: `Só pode carregar ${remainingSlots} imagem(ns)`, title: 'Limite de imagens' });
			return;
		}

		void stopDetailContext.actions.uploadImages(files);
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens"
		>
			<Section>
				<Grid columns="abc" gap="md">
					{images.map((image, index) => (
						<ImageUpload
							key={image._id}
							label={`Imagem ${index + 1}`}
							onDelete={!stopDetailContext.flags.isReadOnly ? () => stopDetailContext.actions.deleteImage(image._id) : undefined}
							value={image.url ?? undefined}
						/>
					))}
				</Grid>
				{remainingSlots > 0 && !stopDetailContext.flags.isReadOnly && (
					<FileButton
						accept="image/png,image/jpeg,image/jpg"
						label="Carregar imagens"
						onFilesChange={handleFilesChange}
						multiple
					/>
				)}
			</Section>
		</Collapsible>
	);

	//
}
