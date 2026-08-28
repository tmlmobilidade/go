'use client';

import { Image, Text } from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhotoCheck, IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteButton } from '../../../buttons';
import { Loader } from '../../../loaders';
import { Divider, Section, Surface } from '../../layout';

/* * */

export interface UploadImageProps {
	isDisabled?: boolean
	isLoading?: boolean
	label?: string
	maxFiles?: number
	maxFileSize?: number
	onDelete?: () => void
	onUpload?: (file: File) => void
	urlValue?: string
}

/**
 * Use this component to handle the frontend part of uploading an image.
 * This component manages the file selection, size and mime type validation,
 * and the preview of the image before it is uploaded.
 */
export function UploadImage({ isDisabled, isLoading, label, maxFiles = 1, maxFileSize = 6 * 1024 * 1024, onDelete, onUpload, urlValue }: UploadImageProps) {
	//

	//
	// B. Setup variables

	const { t } = useTranslation();

	const [previewImageUrl, setPreviewImageUrl] = useState<string>(urlValue);

	//
	// B. Handle actions

	useEffect(() => {
		setPreviewImageUrl(urlValue ?? null);
	}, [urlValue]);

	const handleDrop = (files: FileWithPath[]) => {
		// Only allow one file to be uploaded
		if (files.length > maxFiles) return;
		// const reader = new FileReader();
		// reader.onload = () => setPreviewImageUrl(reader.result as string);
		// reader.readAsDataURL(files[0]);
		if (onUpload) onUpload(files[0]);
	};

	const handleDelete = () => {
		if (urlValue && onDelete) onDelete();
	};

	//
	// C. Render components

	if (isLoading) {
		return (
			<Surface>
				<Section alignItems="center" flexDirection="row" gap="md" height={150} justifyContent="center" padding="lg">
					<Loader size="lg" />
				</Section>
			</Surface>
		);
	}

	if (!previewImageUrl) {
		return (
			<Surface>
				<Dropzone
					accept={IMAGE_MIME_TYPE}
					disabled={isDisabled}
					loading={isLoading}
					maxFiles={1}
					maxSize={maxFileSize}
					onDrop={handleDrop}
				>

					<Dropzone.Idle>
						<Section alignItems="center" flexDirection="row" gap="md" height={150} justifyContent="center" padding="lg">
							<IconPhotoPlus color="var(--color-system-text-200)" size={60} />
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-system-text-100)" fw="semibold" size="xl">{label}</Text>
								<Text c="var(--color-system-text-200)" fw="semibold" size="md">Clique para adicionar uma imagem ou arraste e solte.</Text>
							</Section>
						</Section>
					</Dropzone.Idle>

					<Dropzone.Accept>
						<Section alignItems="center" flexDirection="row" gap="md" height={150} justifyContent="center" padding="lg">
							<IconPhotoCheck color="var(--color-status-success-primary)" size={60} />
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-status-success-primary)" fw="semibold" size="xl">Largue agora!</Text>
								<Text c="var(--color-status-success-primary)" fw="semibold" size="md">O seu ficheiro será carregado automaticamente.</Text>
							</Section>
						</Section>
					</Dropzone.Accept>

					<Dropzone.Reject>
						<Section alignItems="center" flexDirection="row" gap="md" height={150} justifyContent="center" padding="lg">
							<IconX color="var(--color-status-danger-primary)" size={60} />
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-status-danger-primary)" fw="semibold" size="xl">Este ficheiro não é permitido.</Text>
								<Text c="var(--color-status-danger-primary)" fw="semibold" size="md">Pode ser demasiado grande ou não é um ficheiro de imagem.</Text>
							</Section>
						</Section>
					</Dropzone.Reject>

				</Dropzone>
			</Surface>
		);
	}

	return (
		<Surface>
			<Section alignItems="center" flexDirection="row" justifyContent="center" padding="none">
				<Image
					fit="contain"
					h={150}
					src={previewImageUrl}
					w="auto"
				/>
				<Divider orientation="vertical" />
				<Section height="100%" width="100%">
					<Section height="100%" justifyContent="center" padding="none">
						<Text c="var(--color-system-text-100)" fw="semibold" size="xl">{label}</Text>
					</Section>
					<Section flexDirection="row" gap="md" padding="none" width="100%">
						<DeleteButton
							confirmMessage="Tem a certeza que deseja apagar a imagem?"
							confirmTitle="Apagar imagem"
							isDisabled={isDisabled}
							onDelete={handleDelete}
							showConfirmation
						/>
					</Section>
				</Section>
			</Section>
		</Surface>
	);
}
