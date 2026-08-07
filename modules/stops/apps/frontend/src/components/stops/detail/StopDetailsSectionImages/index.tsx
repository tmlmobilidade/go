'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconPhotoPlus } from '@tabler/icons-react';
import { Collapsible, FileButton, Grid, ImageUpload, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopDetailsSectionImages() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const pendingDeletedImageIds = stopDetailContext.data.pendingDeletedImageIds;
	const images = (stopDetailContext.data.images ?? []).filter(image => !pendingDeletedImageIds.includes(image._id));
	const pendingImages = stopDetailContext.data.pendingImages;
	const totalImages = images.length + pendingImages.length;

	//
	// B. Handle actions

	const handleFilesChange = (files: File[]) => {
		stopDetailContext.actions.selectImages(files);
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens"
		>
			<Section>
				<div className={styles.header}>
					<div>
						<Text size="lg" weight="semibold">Galeria da paragem</Text>
						<Text c="var(--color-system-text-300)" size="sm">{totalImages} imagens</Text>
					</div>
				</div>
				<Grid columns="abc" gap="md">
					{images.map((image, index) => (
						<ImageUpload
							key={image._id}
							label={`Imagem ${index + 1}`}
							onDelete={!stopDetailContext.flags.isReadOnly ? () => stopDetailContext.actions.deleteImage(image._id) : undefined}
							value={image.url ?? undefined}
						/>
					))}
					{pendingImages.map((image, index) => (
						<ImageUpload
							key={image.previewUrl}
							label={`Imagem ${images.length + index + 1} · por guardar`}
							onDelete={!stopDetailContext.flags.isReadOnly ? () => stopDetailContext.actions.removePendingImage(index) : undefined}
							value={image.previewUrl}
						/>
					))}
				</Grid>
				{!stopDetailContext.flags.isReadOnly && (
					<div className={styles.uploadAction}>
						<FileButton
							accept="image/png,image/jpeg,image/jpg"
							icon={<IconPhotoPlus size={18} />}
							label="Adicionar imagens"
							onFilesChange={handleFilesChange}
							multiple
						/>
					</div>
				)}
			</Section>
		</Collapsible>
	);

	//
}
