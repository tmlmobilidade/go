'use client';

/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { useValidationCreateContext } from '@/components/validations/create/ValidationCreate.context';
import { AlertMessage, Divider, FileUpload, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function ValidationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();

	//
	// B. Render components

	return (
		<>

			{validationCreateContext.flags.error?.name === 'ValidationError' && (
				<>
					<AlertMessage title={validationCreateContext.flags.error?.message ?? ''} variant="danger" />
					<Divider />
				</>
			)}

			{validationCreateContext.data.form.values.gtfs_agency && (
				<>
					<Section gap="sm">
						<Label size="lg">agency.txt</Label>
						<AgencyDisplay data={validationCreateContext.data.form.values.gtfs_agency} />
					</Section>
					<Divider />
				</>
			)}

			{validationCreateContext.data.form.values.gtfs_feed_info && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<FeedInfoDisplay data={validationCreateContext.data.form.values.gtfs_feed_info} />
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
