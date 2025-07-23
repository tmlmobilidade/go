/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { LabelValueCard } from '@/components/common/LabelValueCard';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

/* * */

export function ValidationsDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Transform data

	const feedStartDateParsed = useMemo(() => {
		try {
			if (!validationsDetailContext.data.validation?.gtfs_feed_info?.feed_start_date) return null;
			return Dates
				.fromOperationalDate(validationsDetailContext.data.validation?.gtfs_feed_info?.feed_start_date, 'Europe/Lisbon')
				.toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR);
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}, [validationsDetailContext.data.validation?.gtfs_feed_info?.feed_start_date]);

	const feedEndDateParsed = useMemo(() => {
		try {
			if (!validationsDetailContext.data.validation?.gtfs_feed_info?.feed_end_date) return null;
			return Dates
				.fromOperationalDate(validationsDetailContext.data.validation?.gtfs_feed_info?.feed_end_date, 'Europe/Lisbon')
				.toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR);
		}
		catch (error) {
			console.log(error);
			return null;
		}
	}, [validationsDetailContext.data.validation?.gtfs_feed_info?.feed_end_date]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Resumo dos dados do arquivo extraídos do ficheiro feed_info.txt"
			title="Dados do Arquivo"
		>

			<Section gap="sm">
				<Grid columns="abc" gap="lg">
					<LabelValueCard label="feed_start_date" value={`${feedStartDateParsed} (${validationsDetailContext.data.validation?.gtfs_feed_info?.feed_start_date || 'N/A'})`} />
					<LabelValueCard label="feed_end_date" value={`${feedEndDateParsed} (${validationsDetailContext.data.validation?.gtfs_feed_info?.feed_end_date || 'N/A'})`} />
					<LabelValueCard label="feed_version" value={validationsDetailContext.data.validation?.gtfs_feed_info?.feed_version || 'N/A'} />
					<LabelValueCard label="feed_contact_email" value={validationsDetailContext.data.validation?.gtfs_feed_info?.feed_contact_email || 'N/A'} />
					<LabelValueCard label="feed_contact_url" value={validationsDetailContext.data.validation?.gtfs_feed_info?.feed_contact_url || 'N/A'} />
					<LabelValueCard label="feed_publisher_name" value={validationsDetailContext.data.validation?.gtfs_feed_info?.feed_publisher_name || 'N/A'} />
					<LabelValueCard label="feed_publisher_url" value={validationsDetailContext.data.validation?.gtfs_feed_info?.feed_publisher_url || 'N/A'} />
				</Grid>
			</Section>

			<Section gap="sm">
				{validationsDetailContext.data.file ? (
					<FileComponent file={validationsDetailContext.data.file} />
				) : (
					<Label>Nenhum ficheiro selecionado</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
