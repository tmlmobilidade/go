import { DeleteActionIcon, FileButton, Label, useToast } from '@tmlmobilidade/ui';
import NextImage from 'next/image';
import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FormType {
	setFieldValue: (field: string, value: any) => void
}

interface ActionsType {
	handleImageChange: (file: File) => void
	getImages: () => any
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
	// const [preview, setPreview] = useState<null | string[]>(imageUrl ?? null);
	const [preview, setPreview] = useState<string[]>([]);

	// // Fetch the image and convert to Data URL
	// const fetchImageAsDataUrl = async (url) => {
	// 	try {
	// 		console.log("--> URL", url);
	// 		const response = await fetch(url);
	// 		console.log("--> RESPONSE", response);
	// 		const blob = await response.blob();
	// 		console.log("--> BLOD", blob);
	// 		const reader = new FileReader();

	// 		return new Promise((resolve, reject) => {
	// 			reader.onloadend = () => {
	// 				resolve(reader.result);  // Return the Data URL
	// 			};
	// 			reader.onerror = reject;
	// 			reader.readAsDataURL(blob);  // Convert the Blob to Data URL
	// 		});
	// 	} catch (error) {
	// 		console.error(`Error fetching URL ${url}:`, error);
	// 		throw error; // Re-throw the error to handle it in the calling function
	// 	}
	// };

	useEffect(() => {
		// // Fetch all images and convert to Data URLs
		// const fetchAllImages = async (urls) => {
		// 	console.log("HERE");
		// 	try {
		// 		const dataUrls = await Promise.all(urls.map(fetchImageAsDataUrl));
		// 		console.log("dataUrls", dataUrls);
		// 		setPreview(dataUrls);  // Set the array of Data URLs
		// 	} catch (err) {
		// 		console.error('Error fetching images:', err);
		// 	}
		// };


		actions.getImages()
			.then((urls: string[]) => {
				console.log("URLS", urls);
				setPreview(urls);
				// fetchAllImages(urls);
			})
			.then(res => console.log("RES", res))
			.catch(err => {
				console.error('Error fetching or converting files:', err);
			});
	}, []);


	// //
	// // B. Transform Data
	// useEffect(() => {
	// 	setPreview(imageUrl ?? null);
	// }, [imageUrl]);

	// useEffect(() => {
	// 	data.form.setFieldValue('image_ids', preview);
	// }, [preview]);

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
		console.log('actions', actions);
		actions.handleImageChange(file);
		actions.getImages();
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
