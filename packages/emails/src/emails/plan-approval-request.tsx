/* * */

import { EmailWrapper, InfoBox, styles } from '@/components/index.js';
import { Button, Hr, Section, Text } from '@react-email/components';
import { getAppConfig } from '@tmlmobilidade/go-lib';
import { type GtfsValidation, type UnixTimestamp } from '@tmlmobilidade/go-types';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export interface PlanApprovalRequestEmailProps {
	solicited_by: string
	validation: GtfsValidation
}

export function PlanApprovalRequestEmail({
	solicited_by,
	validation,
}: PlanApprovalRequestEmailProps) {
	const validation_url = getAppConfig('plans', 'frontend_url') + '/validations/' + validation._id;

	return (
		<EmailWrapper preview="Pedido de aprovação de plano">
			<Section>
				<Text style={styles.text}>
					👋 Olá,
				</Text>

				<Text style={styles.text}>
					Foi solicitada a aprovação para o seguinte plano
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="info">
					<Text style={{ ...styles.text, margin: '0 0 12px 0' }}>
						<strong>📋 Detalhes do Plano</strong>
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>ID da validação:</strong>
						{' '}
						{validation._id}
						<br />
						<strong>Agência:</strong>
						{validation.gtfs_agency?.agency_name || 'Não especificada'}
						<br />
						<strong>Data de Criação:</strong>
						{' '}
						{Dates.fromUnixTimestamp(validation.created_at).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}
					</Text>
				</InfoBox>

				<Button href={validation_url} style={styles.button}>
					Ver plano
				</Button>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.textStyles.muted}>
					<strong>Solicitado por:</strong>
					{' '}
					{solicited_by}
					<br />
					<strong>Data do pedido:</strong>
					{' '}
					{new Date().toLocaleDateString('pt-PT')}
				</Text>
			</Section>
		</EmailWrapper>
	);
};

const mockValidation: GtfsValidation = {
	_id: 'ABC123',
	created_at: 1753885477000 as UnixTimestamp,
	created_by: '',
	feeder_status: 'complete',
	file_id: '64f8b2a3c1d2e3f4a5b6c7d9',
	gtfs_agency: {
		agency_id: 'TML001',
		agency_name: 'Viação Alvorada',
		agency_timezone: 'Europe/Lisbon',
	},
	gtfs_feed_info: {
		feed_lang: 'pt',
	},
	notification_sent: false,
	summary: {
		messages: [],
		total_errors: 0,
		total_warnings: 2,
	},
	updated_at: 1753885477000 as UnixTimestamp,
	updated_by: '',
};

PlanApprovalRequestEmail.PreviewProps = {
	solicited_by: 'Josué Monteiro',
	validation: mockValidation,
} as unknown as PlanApprovalRequestEmailProps;

export default PlanApprovalRequestEmail;
