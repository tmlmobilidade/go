'use client';

/* * */

import { type GtfsRoute } from '@/components/patterns/detail/PatternDetailSectionGtfs/index';
import { IconFileZip, IconUpload, IconX } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dropzone, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import { usePatternDetailContext } from '../PatternDetail.context';

/* * */

const MAX_FILE_SIZE = 100000000; // 100MB

/* * */

interface GtfsParserProps {
	onParse: (data: GtfsRoute[]) => void
}

/* * */

export function GtfsParser({ onParse }: GtfsParserProps) {
	//

	//
	// A. Setup variables

	const [isUploading, setIsUploading] = useState(false);
	const patternDetailContext = usePatternDetailContext();

	//
	// B. Handle actions

	const handleUpload = async (files: File[]) => {
		try {
			setIsUploading(true);
			const formData = new FormData();
			formData.append('file', files[0]);
			formData.append('agency_id', patternDetailContext.data.agency_id);
			const res = await fetch(API_ROUTES.offer.GTFS_PARSE, { body: formData, credentials: 'include', method: 'POST' });
			const data = await res.json();
			onParse(data.data);
			setIsUploading(false);
		} catch (error) {
			console.log(error);
			setIsUploading(false);
		}
	};

	//
	// C. Render components

	return (
		<Dropzone
			loading={isUploading}
			maxSize={MAX_FILE_SIZE}
			onDrop={handleUpload}
			w="100%"
			accept={{
				'application/octet-stream': ['.zip'],
				'application/x-zip': ['.zip'],
				'application/x-zip-compressed': ['.zip'],
				'application/zip': ['.zip'],
			}}
		>
			<Dropzone.Accept>
				<div style={{ alignItems: 'center', display: 'flex', gap: 'var(--mantine-spacing-xl)', minHeight: 100, pointerEvents: 'none' }}>
					<IconUpload size={50} stroke={1.5} />
					<div>
						<Text size="xl">Arraste o ficheiro GTFS para aqui</Text>
						<Text size="sm">O ficheiro será processado automaticamente</Text>
					</div>
				</div>
			</Dropzone.Accept>
			<Dropzone.Reject>
				<div style={{ alignItems: 'center', display: 'flex', gap: 'var(--mantine-spacing-xl)', minHeight: 100, pointerEvents: 'none' }}>
					<IconX size={50} stroke={1.5} />
					<div>
						<Text size="xl">Ficheiro rejeitado</Text>
						<Text size="sm">Apenas ficheiros ZIP são aceites (máximo 100MB)</Text>
					</div>
				</div>
			</Dropzone.Reject>
			<Dropzone.Idle>
				<div style={{ alignItems: 'center', display: 'flex', gap: 'var(--mantine-spacing-xl)', minHeight: 100, pointerEvents: 'none' }}>
					<IconFileZip size={50} stroke={1.5} />
					<div>
						<Text size="xl">Importar ficheiro GTFS</Text>
						<Text size="sm">Arraste um ficheiro ZIP ou clique para selecionar (máximo 100MB)</Text>
					</div>
				</div>
			</Dropzone.Idle>
		</Dropzone>
	);

	//
}
