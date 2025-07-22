/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Grid, Label, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function ValidationDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Render components

	if (!validationDetailContext.data.validation?.gtfs_feed_info) {
		return null;
	}

	return (
		<Collapsible
			description="Resumo dos dados do arquivo extraídos do ficheiro feed_info.txt"
			title="Dados do Arquivo"
		>

			<Section gap="sm">
				<Label caps>Data de vigência</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Data de início</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_feed_info.feed_start_date ? Dates.fromOperationalDate(validationDetailContext.data.validation.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_feed_info.feed_end_date ? Dates.fromOperationalDate(validationDetailContext.data.validation.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>

			<Section gap="sm">
				<Label caps>Outras informações</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Versão</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_feed_info.feed_version ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma padrão</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_feed_info.default_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma do feed</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>

			<Section gap="sm">
				{validationDetailContext.data.file ? (
					<FileComponent file={validationDetailContext.data.file} />
				) : (
					<Label>Nenhum ficheiro selecionado</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
