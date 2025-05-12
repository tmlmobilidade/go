import { DeleteActionIcon, FileButton, Label, useToast } from '@tmlmobilidade/ui';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// import ComponentWrapper from '../ComponentWrapper';
import styles from './styles.module.css';

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

	console.log('imageUrl', imageUrl);

	useEffect(() => {
		setPreview(imageUrl ?? null);
	}, [imageUrl]);

	//
	// B. Handle File Change
	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar imagem',
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = () => setPreview(reader.result as string);
		reader.readAsDataURL(file);

		console.log('file', file);
		console.log('reader', reader);
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
				<div className={styles.imageContainer}>
					<Image alt="Preview" className={styles.image} height={300} src={preview} width={400} />
					{onDelete && (
						<div className={styles.deleteContainer}>
							<DeleteActionIcon
								confirmMessage="Tem certeza que deseja apagar a imagem?"
								confirmTitle="Apagar imagem"
								onConfirm={handleDelete}
								showConfirmation
							/>
						</div>
					)}
				</div>
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
