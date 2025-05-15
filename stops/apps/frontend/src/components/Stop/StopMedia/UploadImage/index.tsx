import { DeleteActionIcon, FileButton, Label, useToast } from '@tmlmobilidade/ui';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// import ComponentWrapper from '../ComponentWrapper';

import styles from './styles.module.css';

interface UploadImageProps {
	data: unknown
	imageUrl?: string[]
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onDelete?: () => void
	onFileChange?: (file: File) => void
}

export function UploadImage({
	data,
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
	const [preview, setPreview] = useState<null | string[]>(imageUrl ?? null);

	//
	// B. Transform Data
	useEffect(() => {
		setPreview(imageUrl ?? null);
	}, [imageUrl]);

	useEffect(() => {
		data.form.setFieldValue('image_ids', preview);
	}, [preview]);

	//
	// C. Handle Actions
	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar imagem',
			});
			return;
		}

		const reader = new FileReader();

		reader.onload = () => setPreview([...(preview || []), reader.result as string]);

		reader.readAsDataURL(file);

		onFileChange?.(file);
	};

	const handleDelete = (index) => {
		const files = [...preview];
		files.splice(index, 1);
		setPreview(files);
		if (imageUrl && onDelete) onDelete();
	};

	//
	// D. Render components
	return (
		<div className={styles.container}>
			{label && <Label>{label}</Label>}
			{preview?.map((image_id: string, index: number) => (
				image_id ? (
					<div key={index} className={styles.imageContainer}>
						<Image alt="Preview" className={styles.image} height={maxHeight} src={image_id} width={maxWidth} />
						{onDelete && (
							<div className={styles.deleteContainer}>
								<DeleteActionIcon
									confirmMessage="Tem certeza que deseja apagar a imagem?"
									confirmTitle="Apagar imagem"
									onConfirm={() => handleDelete(index)}
									showConfirmation
								/>
							</div>
						)}
					</div>
				) : null
			))}

			<FileButton
				accept="image/*"
				label="Carregar imagem"
				onFileChange={handleFileChange}
			/>
		</div>
	);
}
