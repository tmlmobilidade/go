'use client';

import { Image } from '@mantine/core';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { useToast } from '../../../hooks/toast';
import { DeleteButton } from '../../buttons/DeleteButton';
import { ComponentWrapper } from '../../common/ComponentWrapper';
import { Label } from '../../display/Label';
import { FileButton } from '../FileButton';

/* * */

export interface ImageUploadProps {
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onChange?: (file: File) => void
	onDelete?: () => void
	value?: string
}

/* * */

export function ImageUpload({
	label,
	maxFileSize = 6 * 1024 * 1024, // 5MB default
	maxHeight = 300,
	maxWidth = 400,
	onChange,
	onDelete,
	value,
}: ImageUploadProps) {
	//

	//
	// A. Setup variables

	const [previewImageUrl, setPreviewImageUrl] = useState<null | string>(value ?? null);

	//
	// B. Handle actions

	useEffect(() => {
		setPreviewImageUrl(value ?? null);
	}, [value]);

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
		if (onChange) onChange(file);
	};

	const handleDelete = () => {
		if (value && onDelete) onDelete();
	};

	//
	// C. Render components

	return (
		<div className={styles.container} style={{ maxHeight, maxWidth }}>
			{label && <Label>{label}</Label>}
			{previewImageUrl ? (
				<ComponentWrapper>
					<Image
						alt="Preview"
						fit="contain"
						mih={200}
						miw={200}
						src={previewImageUrl}
					/>
					{onDelete && (
						<div className={styles.deleteContainer}>
							<DeleteButton
								confirmMessage="Tem certeza que deseja apagar a imagem?"
								confirmTitle="Apagar imagem"
								onDelete={handleDelete}
								showConfirmation
							/>
						</div>
					)}
				</ComponentWrapper>
			) : (
				<FileButton
					accept="image/*"
					label="Carregar imagem"
					onFileChange={handleFileChange}
				/>
			)}
		</div>
	);
}
