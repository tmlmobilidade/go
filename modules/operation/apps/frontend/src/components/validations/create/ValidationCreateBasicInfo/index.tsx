'use client';

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { AlertMessage, Divider, FileUpload, Label, Section, Select } from '@tmlmobilidade/ui';

import { useValidationCreateContext } from '../ValidationCreateForm.context';

/* * */

export function ValidationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();
	const gtfsAgency = validationCreateContext.form.watch('gtfs_agency');
	const gtfsFeedInfo = validationCreateContext.form.watch('gtfs_feed_info');

	//
	// B. Render components

	return (
		<>

			{validationCreateContext.data.validationError && (
				<>
					<AlertMessage title={validationCreateContext.data.validationError.message} variant="danger" />
					<Divider />
				</>
			)}

			{validationCreateContext.data.agencyOptions.length > 1 && (
				<>
					<Section gap="sm">
						<Label size="lg">Selecione a agência para a validação</Label>
						<Select
							clearable={false}
							data={validationCreateContext.data.agencyOptions}
							onChange={validationCreateContext.actions.setSelectedAgencyId}
							value={validationCreateContext.data.selectedAgencyId}
							w="100%"
						/>
					</Section>
					<Divider />
				</>
			)}

			{gtfsAgency && (
				<>
					<Section gap="sm">
						<Label size="lg">agency.txt</Label>
						<AgencyDisplay data={gtfsAgency} />
					</Section>
					<Divider />
				</>
			)}

			{gtfsFeedInfo && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<FeedInfoDisplay data={gtfsFeedInfo} />
					</Section>
					<Divider />
				</>
			)}

			<Section>
				<FileUpload
					accept="application/zip"
					label="Selecionar Arquivo GTFS"
					maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
					onFileChange={validationCreateContext.actions.setValidationFile}
				/>
			</Section>

		</>
	);

	//
}
