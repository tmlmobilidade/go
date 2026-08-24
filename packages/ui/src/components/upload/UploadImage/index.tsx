'use client';

import { Group, Image, Menu, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconPhoto, IconPhotoCheck, IconPhotoPlus, IconTrash, IconX } from '@tabler/icons-react';
import { ComponentPropsWithRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { DeleteButton } from '../../../buttons';
import { useToast } from '../../../hooks/toast';
import { ComponentWrapper } from '../../common/ComponentWrapper';
import { Label } from '../../display/Label';
import { Divider, Grid, Section, Surface } from '../../layout';

/* * */

export interface UploadImageProps {
	isDisabled?: boolean
	isLoading?: boolean
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onDelete?: () => void
	onUpload?: (file: File) => void
	urlValue?: string
}

/**
 * Use this component to handle the frontend part of uploading an image.
 * This component manages the file selection, size and mime type validation,
 * and the preview of the image before it is uploaded.
 */
export function UploadImage({ isDisabled, isLoading, label, maxFileSize = 6 * 1024 * 1024, maxHeight = 300, maxWidth = 400, onDelete, onUpload, urlValue }: UploadImageProps) {
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

	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar imagem',
			});
			return;
		}
		const reader = new FileReader();
		reader.onload = () => setPreviewImageUrl(reader.result as string);
		reader.readAsDataURL(file);
		if (onUpload) onUpload(file);
	};

	const handleDelete = () => {
		if (urlValue && onDelete) onDelete();
	};

	//
	// C. Render components

	if (!previewImageUrl) {
		return (
			<Surface>
				<Dropzone
					accept={IMAGE_MIME_TYPE}
					maxSize={maxFileSize}
					onDrop={files => console.log('accepted files', files)}
				>
					<Dropzone.Accept>
						<Grid columns="abb" hAlign="center" vAlign="center">
							<Section alignItems="center" justifyContent="center">
								<IconPhotoCheck color="var(--color-status-success-primary)" size={52} />
							</Section>
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-status-success-primary)" fw="semibold" size="xl">Largue agora!</Text>
								<Text c="var(--color-status-success-primary)" fw="semibold" size="md">O seu ficheiro será carregado automaticamente.</Text>
							</Section>
						</Grid>
					</Dropzone.Accept>
					<Dropzone.Reject>
						<Grid columns="abb" hAlign="center" vAlign="center">
							<IconX color="var(--color-status-danger-primary)" size={52} />
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-status-danger-primary)" fw="semibold" size="xl">Este ficheiro não é permitido.</Text>
								<Text c="var(--color-status-danger-primary)" fw="semibold" size="md">Pode ser demasiado grande ou não é um ficheiro de imagem.</Text>
							</Section>
						</Grid>
					</Dropzone.Reject>
					<Dropzone.Idle>
						<Grid columns="abb" hAlign="center" vAlign="center">
							<Section alignItems="center" justifyContent="center">
								<IconPhotoPlus color="var(--color-system-text-200)" size={52} />
							</Section>
							<Section flexDirection="column" gap="xs" padding="none" width="100%">
								<Text c="var(--color-system-text-100)" fw="semibold" size="xl">{label}</Text>
								<Text c="var(--color-system-text-200)" fw="semibold" size="md">Clique para adicionar uma imagem ou arraste e solte.</Text>
							</Section>
						</Grid>
					</Dropzone.Idle>
				</Dropzone>
			</Surface>
		);
	}

	return (
		<div style={{ maxWidth: 200 }}>
			<Surface>
				<Image fit="contain" src={previewImageUrl} />
				<Divider />
				<Section flexDirection="row">
					<DeleteButton
						confirmMessage="Tem a certeza que deseja apagar a imagem?"
						confirmTitle="Apagar imagem"
						onDelete={handleDelete}
						showConfirmation
					/>
				</Section>
			</Surface>
		</div>
	);
}
