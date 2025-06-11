/* * */

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { IconAlertCircle, IconAlertTriangle, IconEdit } from '@tabler/icons-react';
import { Collapsible, Divider, Grid, Label, Section, Text } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import { OpenEditDateModal } from '../EditDateModal';
import styles from './styles.module.css';

/* * */

export function PlanDetailSectionInfo() {
	//

	//
	// A. Setup variables
	const { actions, data: { plan } } = usePlanDetailContext();

	//
	// B. Setup functions
	const handleEditDate = (type: 'end' | 'start') => () => {
		OpenEditDateModal({
			description: (
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<IconAlertTriangle color="var(--color-status-danger-primary)" style={{ marginTop: '4px' }} />
					<Text size="base">
						Esta ação irá alterar a data de {type === 'start' ? 'início' : 'fim'} da vigência do plano no ficheiro <b>feed_info.txt</b> do <b>GTFS</b>.
					</Text>
				</Section>
			),
			label: `Data de ${type === 'start' ? 'início' : 'fim'}`,
			onConfirm: (value) => {
				actions.editDate(type)(value);
			},
			value: Dates.fromUnixTimestamp(plan.gtfs_feed_info[type === 'start' ? 'feed_start_date' : 'feed_end_date']).iso,
		});
	};

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
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
							<Label size="sm" caps>Data de início</Label>
							<IconEdit className={styles.editIcon} onClick={handleEditDate('start')} size={16} />
						</Section>
						<Text size="base">{plan.gtfs_feed_info.feed_start_date ? Dates.fromUnixTimestamp(plan.gtfs_feed_info.feed_start_date).toFormat('dd/MM/yyyy') : 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
							<Label size="sm" caps>Data de fim</Label>
							<IconEdit className={styles.editIcon} onClick={handleEditDate('end')} size={16} />
						</Section>
						<Text size="base">{plan.gtfs_feed_info.feed_end_date ? Dates.fromUnixTimestamp(plan.gtfs_feed_info.feed_end_date).toFormat('dd/MM/yyyy') : 'N/A'}</Text>
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
