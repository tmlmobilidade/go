/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function ValidationDetailSectionInfo() {
	//

	//
	// A. Setup variables
	const { data: { validation } } = useValidationDetailContext();

	//
	// C. Render components

	if (!validation?.gtfs_agency || !validation?.gtfs_feed_info) return null;

	const renderAgencyInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Agência</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Agência</Label>
						<Text size="base">{validation.gtfs_agency.agency_id} - {validation.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL da agência</Label>
						<Text size="base">{validation.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{validation.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{validation.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	const renderDatesInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Data de vigência</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Data de início</Label>
						<Text size="base">{validation.gtfs_feed_info.feed_start_date ? Dates.fromOperationalDate(validation.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{validation.gtfs_feed_info.feed_end_date ? Dates.fromOperationalDate(validation.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	const renderMiscInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Outras informações</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Versão</Label>
						<Text size="base">{validation.gtfs_feed_info.feed_version ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma padrão</Label>
						<Text size="base">{validation.gtfs_feed_info.default_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma do feed</Label>
						<Text size="base">{validation.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	return (
		<Collapsible
			description="Informações gerais sobre o ficheiro GTFS, estas informações são extraídas dos ficheiros feed_info.txt e agency.txt"
			title="Informação do ficheiro GTFS"
		>
			{renderAgencyInfo()}
			<Divider />
			{renderDatesInfo()}
			<Divider />
			{renderMiscInfo()}
		</Collapsible>
	);
}
