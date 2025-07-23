'use client';

/* * */

import { LabelValueCard } from '@/components/common/LabelValueCard';
import { UploadFile } from '@/components/common/UploadFile';
import { useValidationsCreateContext, ValidationsCreateContextProvider } from '@/contexts/ValidationsCreate.context';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, closeModal, Divider, Grid, Label, MeContextProvider, openModal, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export const CREATE_VALIDATION_MODAL_ID = 'create-validation-modal';

/* * */

export const openCreateValidationModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<ValidationsCreateContextProvider>
					<CreateValidationModal />
				</ValidationsCreateContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: CREATE_VALIDATION_MODAL_ID,
		padding: 0,
		size: 'auto',
		withCloseButton: false,
	});
};

/* * */

export default function CreateValidationModal() {
	//

	//
	// A. Setup variables

	const validationsCreateContext = useValidationsCreateContext();

	//
	// B. Transform data

	const feedStartDateParsed = useMemo(() => {
		try {
			if (!validationsCreateContext.data.form.values.gtfs_feed_info?.feed_start_date) return null;
			return Dates
				.fromOperationalDate(validationsCreateContext.data.form.values.gtfs_feed_info?.feed_start_date, 'Europe/Lisbon')
				.toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR);
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}, [validationsCreateContext.data.form.values.gtfs_feed_info?.feed_start_date]);

	const feedEndDateParsed = useMemo(() => {
		try {
			if (!validationsCreateContext.data.form.values.gtfs_feed_info?.feed_end_date) return null;
			return Dates
				.fromOperationalDate(validationsCreateContext.data.form.values.gtfs_feed_info?.feed_end_date, 'Europe/Lisbon')
				.toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR);
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}, [validationsCreateContext.data.form.values.gtfs_feed_info?.feed_end_date]);

	//
	// C. Render Components

	const renderError = () => {
		if (validationsCreateContext.flags.error && validationsCreateContext.flags.error.name === 'ValidationError') {
			return (
				<div className={styles.errorContainer}>
					<IconAlertCircle size={20} />
					<Text size="base">{validationsCreateContext.flags.error.message}</Text>
				</div>
			);
		}
		return null;
	};

	return (
		<>

			<Section gap="xs">
				<Label size="lg" caps>Nova Validação GTFS</Label>
				<Text>Selecione um arquivo GTFS para iniciar a validação.</Text>
			</Section>

			<Divider />

			{renderError()}

			{validationsCreateContext.flags.error && validationsCreateContext.flags.error.name === 'ValidationError' && (
				<div className={styles.errorContainer}>
					<IconAlertCircle size={20} />
					<Text size="base">{validationsCreateContext.flags.error.message}</Text>
				</div>
			)}

			<Section gap="sm">
				<Label size="lg">agency.txt</Label>
				<Grid columns="abc" gap="lg">
					<LabelValueCard label="agency_id" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_id || 'N/A'} />
					<LabelValueCard label="agency_name" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_name || 'N/A'} />
					<LabelValueCard label="agency_url" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_url || 'N/A'} />
					<LabelValueCard label="agency_email" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_email || 'N/A'} />
					<LabelValueCard label="agency_timezone" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_timezone || 'N/A'} />
					<LabelValueCard label="agency_fare_url" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_fare_url || 'N/A'} />
					<LabelValueCard label="agency_lang" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_lang || 'N/A'} />
					<LabelValueCard label="agency_phone" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_phone || 'N/A'} />
				</Grid>
			</Section>
			<Divider />

			<Section gap="sm">
				<Label size="lg">feed_info.txt</Label>
				<Grid columns="abc" gap="lg">
					<LabelValueCard label="feed_start_date" value={`${feedStartDateParsed} (${validationsCreateContext.data.form.values.gtfs_feed_info?.feed_start_date || 'N/A'})`} />
					<LabelValueCard label="feed_end_date" value={`${feedEndDateParsed} (${validationsCreateContext.data.form.values.gtfs_feed_info?.feed_end_date || 'N/A'})`} />
					<LabelValueCard label="feed_lang" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_lang || 'N/A'} />
					<LabelValueCard label="feed_contact_email" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_contact_email || 'N/A'} />
					<LabelValueCard label="feed_contact_url" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_contact_url || 'N/A'} />
				</Grid>
			</Section>
			<Divider />

			<Section>
				<UploadFile
					label="Ficheiro GTFS"
					maxFileSize={5 * 1024 * 1024 * 1024} // 5GB
					onFileChange={validationsCreateContext.actions.setValidationFile}
				/>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						label="Cancelar"
						onClick={() => closeModal(CREATE_VALIDATION_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						label="Criar validação"
						loading={validationsCreateContext.flags.loading}
						onClick={validationsCreateContext.actions.saveValidation}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
