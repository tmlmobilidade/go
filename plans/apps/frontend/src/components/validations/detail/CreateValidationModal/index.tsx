'use client';

/* * */

import { useValidationsCreateContext, ValidationsCreateContextProvider } from '@/contexts/ValidationsCreate.context';
import { AlertMessage, Button, closeModal, Divider, FileUpload, Grid, Label, MeContextProvider, openModal, Section, Text, ValueDisplay } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

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

	return (
		<>

			<Section gap="xs">
				<Label size="lg" caps>Nova Validação GTFS</Label>
				<Text>Selecione um arquivo GTFS para iniciar a validação.</Text>
			</Section>

			<Divider />

			{validationsCreateContext.flags.error && validationsCreateContext.flags.error.name === 'ValidationError' && (
				<>
					<AlertMessage title={validationsCreateContext.flags.error?.message ?? 'odjisodj'} variant="danger" />
					<Divider />
				</>
			)}

			{validationsCreateContext.data.form.values.gtfs_agency && (
				<>
					<Section gap="sm">
						<Label size="lg">agency.txt</Label>
						<Grid columns="abc" gap="lg">
							<ValueDisplay label="agency_id" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_id || 'N/A'} />
							<ValueDisplay label="agency_name" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_name || 'N/A'} />
							<ValueDisplay label="agency_url" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_url || 'N/A'} />
							<ValueDisplay label="agency_email" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_email || 'N/A'} />
							<ValueDisplay label="agency_timezone" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_timezone || 'N/A'} />
							<ValueDisplay label="agency_fare_url" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_fare_url || 'N/A'} />
							<ValueDisplay label="agency_lang" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_lang || 'N/A'} />
							<ValueDisplay label="agency_phone" value={validationsCreateContext.data.form.values.gtfs_agency?.agency_phone || 'N/A'} />
						</Grid>
					</Section>
					<Divider />
				</>
			)}

			{validationsCreateContext.data.form.values.gtfs_feed_info && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<Grid columns="abc" gap="lg">
							<ValueDisplay label="feed_start_date" value={`${feedStartDateParsed} (${validationsCreateContext.data.form.values.gtfs_feed_info?.feed_start_date || 'N/A'})`} />
							<ValueDisplay label="feed_end_date" value={`${feedEndDateParsed} (${validationsCreateContext.data.form.values.gtfs_feed_info?.feed_end_date || 'N/A'})`} />
							<ValueDisplay label="feed_lang" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_lang || 'N/A'} />
							<ValueDisplay label="feed_contact_email" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_contact_email || 'N/A'} />
							<ValueDisplay label="feed_contact_url" value={validationsCreateContext.data.form.values.gtfs_feed_info?.feed_contact_url || 'N/A'} />
						</Grid>
					</Section>
					<Divider />
				</>
			)}

			<Section>
				<FileUpload
					accept="application/zip"
					label="Selecionar Arquivo GTFS"
					maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
					onFileChange={validationsCreateContext.actions.setValidationFile}
				/>
			</Section>

			<Divider />

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={validationsCreateContext.flags.loading}
						label="Cancelar"
						onClick={() => closeModal(CREATE_VALIDATION_MODAL_ID)}
						variant="secondary"
					/>
					<Button
						disabled={!validationsCreateContext.flags.can_create}
						label="Criar validação"
						loading={validationsCreateContext.flags.loading}
						onClick={validationsCreateContext.actions.createValidation}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
