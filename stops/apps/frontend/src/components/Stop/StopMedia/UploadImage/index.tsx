import { DeleteActionIcon, FileButton, Label, useToast } from '@tmlmobilidade/ui';
import NextImage from 'next/image';
import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FormType {
	setFieldValue: (field: string, value: unknown) => void
	values: {
		image_ids: string[]
	}
}

interface ActionsType {
	deleteImage: (image_id: string) => void
	getImages: () => unknown
	handleImageChange: (file: File) => void
}

interface UploadImageProps {
	actions: ActionsType
	data: { form: FormType }
	imageUrl?: string[]
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onDelete?: () => void
	onFileChange?: (file: File) => void
}

/* * */

export function UploadImage({
	actions,
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

	const [preview, setPreview] = useState<string[]>([]);

	useEffect(() => {
		(actions.getImages() as Promise<string[]>)
			.then((urls: string[]) => {
				setPreview(urls);
			})
			.catch((err) => {
				console.error('Error fetching or converting files:', err);
			});
	}, []);

	//
	// B. Handle Actions

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
		console.log('actions', actions);
		actions.handleImageChange(file);
		actions.getImages();
	};

	const handleDelete = (index) => {
		actions.deleteImage(data.form.values.image_ids[index]);
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
						<NextImage alt="Preview" className={styles.image} height={maxHeight} src={image_id} width={maxWidth} />
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
