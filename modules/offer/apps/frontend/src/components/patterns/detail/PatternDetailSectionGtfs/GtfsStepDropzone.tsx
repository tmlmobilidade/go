'use client';

/* * */

import { IconFileZip, IconUpload, IconX } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dropzone, Text, useToast } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GtfsRoute, GtfsTrip } from './GtfsImport.modal';

/* * */

const MAX_FILE_SIZE = 100000000; // 100MB

/* * */

interface GtfsStepDropzoneProps {
	onNext: (trips: GtfsTrip[]) => void
}

/* * */

export function GtfsStepDropzone({ onNext }: GtfsStepDropzoneProps) {
	const { t } = useTranslation();

	//

	const [isUploading, setIsUploading] = useState(false);

	const handleUpload = async (files: File[]) => {
		try {
			setIsUploading(true);
			const formData = new FormData();
			formData.append('file', files[0]);
			const res = await fetch(API_ROUTES.offer.GTFS_PARSE, { body: formData, credentials: 'include', method: 'POST' });
			const data = await res.json();
			const parsed: GtfsTrip[] = [];
			for (const route of (data.data as GtfsRoute[])) {
				for (const trip of route.trips) {
					parsed.push(trip);
				}
			}
			onNext(parsed);
			setIsUploading(false);
		} catch {
			useToast.error({ message: t('patterns:detail.GtfsStepDropzone.upload_error') });
			setIsUploading(false);
		}
	};

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
						<Text size="xl">{t('patterns:detail.GtfsStepDropzone.drop_gtfs')}</Text>
						<Text size="sm">{t('patterns:detail.GtfsStepDropzone.process_automatically')}</Text>
					</div>
				</div>
			</Dropzone.Accept>
			<Dropzone.Reject>
				<div style={{ alignItems: 'center', display: 'flex', gap: 'var(--mantine-spacing-xl)', minHeight: 100, pointerEvents: 'none' }}>
					<IconX size={50} stroke={1.5} />
					<div>
						<Text size="xl">{t('patterns:detail.GtfsStepDropzone.file_rejected')}</Text>
						<Text size="sm">{t('patterns:detail.GtfsStepDropzone.zip_only')}</Text>
					</div>
				</div>
			</Dropzone.Reject>
			<Dropzone.Idle>
				<div style={{ alignItems: 'center', display: 'flex', gap: 'var(--mantine-spacing-xl)', minHeight: 100, pointerEvents: 'none' }}>
					<IconFileZip size={50} stroke={1.5} />
					<div>
						<Text size="xl">{t('patterns:detail.GtfsStepDropzone.import_gtfs')}</Text>
						<Text size="sm">{t('patterns:detail.GtfsStepDropzone.choose_zip')}</Text>
					</div>
				</div>
			</Dropzone.Idle>
		</Dropzone>
	);

	//
}

