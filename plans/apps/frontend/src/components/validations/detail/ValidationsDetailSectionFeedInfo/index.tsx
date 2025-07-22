/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Collapsible, Grid, Label, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function ValidationsDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Render components

	if (!validationsDetailContext.data.validation?.gtfs_feed_info) {
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
						<Text size="base">{validationsDetailContext.data.validation.gtfs_feed_info.feed_start_date ? Dates.fromOperationalDate(validationsDetailContext.data.validation.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{validationsDetailContext.data.validation.gtfs_feed_info.feed_end_date ? Dates.fromOperationalDate(validationsDetailContext.data.validation.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>

			<Section gap="sm">
				<Label caps>Outras informações</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Versão</Label>
						<Text size="base">{validationsDetailContext.data.validation.gtfs_feed_info.feed_version ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma padrão</Label>
						<Text size="base">{validationsDetailContext.data.validation.gtfs_feed_info.default_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma do feed</Label>
						<Text size="base">{validationsDetailContext.data.validation.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
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
