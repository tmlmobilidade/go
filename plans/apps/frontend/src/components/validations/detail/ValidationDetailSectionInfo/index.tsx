/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function ValidationDetailSectionInfo() {
	//

	//
	// A. Setup variables
	const { data: { form } } = useValidationDetailContext();

	//
	// C. Render components

	if (!form.values.gtfs_feed_info) return null;

	const renderAgencyInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Agência</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Agência</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_publisher_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL da agência</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_publisher_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_contact_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_contact_url ?? 'N/A'}</Text>
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
						<Text size="base">{form.values.gtfs_feed_info.feed_start_date ? Dates.fromUnixTimestamp(form.values.gtfs_feed_info.feed_start_date).toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Data de fim</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_end_date ? Dates.fromUnixTimestamp(form.values.gtfs_feed_info.feed_end_date).toFormat('dd/MM/yyyy') : 'N/A'}</Text>
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
						<Text size="base">{form.values.gtfs_feed_info.feed_version ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma padrão</Label>
						<Text size="base">{form.values.gtfs_feed_info.default_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma do feed</Label>
						<Text size="base">{form.values.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	return (
		<Collapsible
			description="Informações gerais sobre o ficheiro GTFS, estas informações são extraídas do ficheiro feed_info.txt"
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
