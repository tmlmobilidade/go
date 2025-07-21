/* * */

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { IconInfoCircle } from '@tabler/icons-react';
import { Collapsible, DatePicker, Divider, Grid, Label, Section, Text, Tooltip } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function PlanDetailSectionInfo() {
	//

	//
	// A. Setup variables
	const { data: { form, plan } } = usePlanDetailContext();

	//
	// B. Transform data

	const startDateValue = form.values.gtfs_feed_info.feed_start_date;
	const endDateValue = form.values.gtfs_feed_info.feed_end_date;

	const startDate = startDateValue ? Dates.fromOperationalDate(startDateValue, 'Europe/Lisbon').js_date : null;
	const endDate = endDateValue ? Dates.fromOperationalDate(endDateValue, 'Europe/Lisbon').js_date : null;

	//
	// C. Render components

	const renderAgencyInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Agência</Label>
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Agência</Label>
						<Text size="base">{plan.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL da agência</Label>
						<Text size="base">{plan.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{plan.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{plan.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		);
	};

	const renderDatesInfo = () => {
		return (
			<Section gap="sm">
				<Label caps>Data de vigência</Label>
				<Grid columns="ab" gap="sm">
					<Section flexDirection="column" gap="sm" padding="none">
						<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
							<Label size="sm" caps>Data de início</Label>
							<Tooltip label="Esta data provém do ficheiro feed_info.txt. Ao alterar esta data, o ficheiro feed_info.txt será atualizado." position="right">
								<IconInfoCircle color="var(--color-status-warning-primary)" cursor="pointer" size={16} strokeWidth={2.5} />
							</Tooltip>
						</Section>
						<DatePicker
							{...form.getInputProps('gtfs_feed_info.feed_start_date')}
							value={startDate}
							onChange={(date) => {
								form.setFieldValue('gtfs_feed_info.feed_start_date', Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date);
							}}
						/>
					</Section>
					<Section flexDirection="column" gap="sm" padding="none">
						<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
							<Label size="sm" caps>Data de fim</Label>
							<Tooltip label="Esta data provém do ficheiro feed_info.txt. Ao alterar esta data, o ficheiro feed_info.txt será atualizado." position="right">
								<IconInfoCircle color="var(--color-status-warning-primary)" cursor="pointer" size={16} strokeWidth={2.5} />
							</Tooltip>
						</Section>
						<DatePicker
							{...form.getInputProps('gtfs_feed_info.feed_end_date')}
							value={endDate}
							onChange={(date) => {
								form.setFieldValue('gtfs_feed_info.feed_end_date', Dates.fromFormat(date, 'yyyy-MM-dd', 'Europe/Lisbon').operational_date);
							}}
							fullWidth
						/>
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
						<Text size="base">{plan.gtfs_feed_info.feed_version ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma padrão</Label>
						<Text size="base">{plan.gtfs_feed_info.default_lang?.toUpperCase() ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Idioma do feed</Label>
						<Text size="base">{plan.gtfs_feed_info.feed_lang?.toUpperCase() ?? 'N/A'}</Text>
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
