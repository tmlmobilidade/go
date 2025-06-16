import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { IconFile, IconWorldUpload } from '@tabler/icons-react';
import { ActionIcon, DeleteActionIcon, FileButton, Grid, Label, Tooltip, useToast } from '@tmlmobilidade/ui';
import NextImage from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface FormType {
	setFieldValue: (field: string, value: unknown) => void
	values: {
		file_ids: string[]
	}
}

interface UploadImageProps {
	fileUrl?: string[]
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onDelete?: () => void
	onFileChange?: (file: File) => void
}

/* * */

export function UploadFile({
	fileUrl,
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

	const stopsDetailContext = useStopsDetailContext();
	const [preview, setPreview] = useState<string[]>([]);
	const [changed, setChanged] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			(stopsDetailContext.actions.getFiles(stopsDetailContext.data._id) as unknown as Promise<string[]>)
				.then((urls: string[]) => {
					setPreview(urls);
				})
				.catch((err) => {
					console.error('Error fetching or converting files:', err);
				});
		}, 1000);
	}, [changed]);

	//
	// B. Transform Data

	const extractTextBetweenSlashAndQuestionMark = (url) => {
		// const regex = /(?<=\/)([^\/\?]*\.[^\/\?]*)(?=\?)/;
		const regex = /(?<=\/)([^/?]*\.[^/?]*)(?=\?)/;
		const match = url.match(regex);
		// setListNames(prev => [...prev, match ? match[0] : '']);
		return match ? match[0] : null;
	};

	//
	// C. Handle Actions
	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar ficheiro',
			});
			return;
		}

		const reader = new FileReader();

		reader.onload = () => setPreview([...(preview || []), reader.result as string]);

		reader.readAsDataURL(file);

		onFileChange?.(file);

		stopsDetailContext.actions.handleFileChange(file);
		stopsDetailContext.actions.getFiles(stopsDetailContext.data._id);

		setChanged(!changed);
	};

	const handleDelete = (index) => {
		stopsDetailContext.actions.deleteFile(stopsDetailContext.data.form.values.file_ids[index]);
		const files = [...preview];
		files.splice(index, 1);
		setPreview(files);
		if (fileUrl && onDelete) onDelete();
	};

	//
	// D. Render components
	return (
		<div className={styles.container}>
			{label && <Label>{label}</Label>}
			{preview?.map((file_id: string, index: number) => (
				file_id ? (
					<div key={index} className={styles.imageContainer}>
						{/* <NextImage alt="Preview" className={styles.image} height={maxHeight} src={file_id} width={maxWidth} /> */}
						<Link href={file_id} target="_blank">
							<Tooltip label="Descarregar Ficheiro" position="bottom">
								<ActionIcon
									className={styles.iconBlue}
									variant="secondary"
								>
									<IconFile />
									<div onClick={() => alert(file_id)}>{extractTextBetweenSlashAndQuestionMark(file_id)}</div>
								</ActionIcon>
							</Tooltip>
						</Link>
						{onDelete && (
							<div className={styles.deleteContainer}>
								<DeleteActionIcon
									confirmMessage="Tem certeza que deseja apagar a ficheiro?"
									confirmTitle="Apagar ficheiro"
									onConfirm={() => handleDelete(index)}
									showConfirmation
								/>
							</div>
						)}
					</div>
				) : null
			))}

			<FileButton
				// accept="image/*"
				label="Carregar ficheiro"
				onFileChange={handleFileChange}
			/>
		</div>
	);
}
