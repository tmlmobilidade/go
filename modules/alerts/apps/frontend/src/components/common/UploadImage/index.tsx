import { DeleteButton, FileButton, Label, useToast } from '@tmlmobilidade/ui';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import ComponentWrapper from '../ComponentWrapper';

interface UploadImageProps {
	imageUrl?: string
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onDelete?: () => void
	onFileChange?: (file: File) => void
}

export function UploadImage({
	imageUrl,
	label,
	maxFileSize = 6 * 1024 * 1024, // 5MB default
	maxHeight = 300,
	maxWidth = 400,
	onDelete,
	onFileChange,
}: UploadImageProps) {
	//

	//
	// A. Setup variables
	const [preview, setPreview] = useState<null | string>(imageUrl ?? null);
	const { t } = useTranslation('global', { keyPrefix: 'components.uploadImage' });

	useEffect(() => {
		setPreview(imageUrl ?? null);
	}, [imageUrl]);

	//
	// B. Handle File Change
	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: t('error_message'),
				title: t('error_title'),
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = () => setPreview(reader.result as string);
		reader.readAsDataURL(file);

		onFileChange?.(file);
	};

	const handleDelete = () => {
		setPreview(null);
		if (imageUrl && onDelete) onDelete();
	};

	//
	// C. Render components
	return (
		<div className={styles.container} style={{ maxHeight, maxWidth }}>
			{label && <Label>{label}</Label>}
			{preview ? (
				<ComponentWrapper className={styles.imageContainer}>
					<Image alt="Preview" className={styles.image} height={300} src={preview} width={400} />
					{onDelete && (
						<div className={styles.deleteContainer}>
							<DeleteButton
								confirmMessage={t('delete_image_confirmation_message')}
								confirmTitle={t('delete_image_title')}
								onDelete={handleDelete}
								showConfirmation
							/>
						</div>
					)}
				</ComponentWrapper>
			) : (
				<FileButton
					accept="image/*"
					label={t('file_button_label')}
					onFileChange={handleFileChange}
				/>
			)}
		</div>
	);
}
