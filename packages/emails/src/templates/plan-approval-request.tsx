/* * */

import { EmailWrapper, InfoBox, styles } from '@/components/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Button, Hr, render, Section, Text } from '@react-email/components';
import { getAppConfig } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type GtfsValidation, type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export const planApprovalRequestSubject = 'Pedido de aprovação de plano';

/* * */

export interface PlanApprovalRequestTemplateProps {
	solicitedBy: string
	validation: GtfsValidation
}

/* * */

export default function PlanApprovalRequestTemplate({ solicitedBy, validation }: PlanApprovalRequestTemplateProps) {
	//

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
					{solicitedBy}
					<br />
					<strong>Data do pedido:</strong>
					{' '}
					{new Date().toLocaleDateString('pt-PT')}
				</Text>
			</Section>
		</EmailWrapper>
	);
};

/* * */

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
	is_locked: false,
	notification_sent: false,
	summary: {
		messages: [],
		total_errors: 0,
		total_warnings: 2,
	},
	updated_at: 1753885477000 as UnixTimestamp,
	updated_by: '',
};

PlanApprovalRequestTemplate.PreviewProps = {
	solicitedBy: 'Josué Monteiro',
	validation: mockValidation,
} satisfies PlanApprovalRequestTemplateProps;

/* * */

export const renderPlanApprovalRequestTemplate = async (props: PlanApprovalRequestTemplateProps) => {
	return await render(<PlanApprovalRequestTemplate {...props} />);
};

/* * */

export const sendPlanApprovalRequestEmail = async ({ data, to }: SendEmailProps<PlanApprovalRequestTemplateProps>) => {
	await emailProvider.send({
		html: await renderPlanApprovalRequestTemplate(data),
		subject: planApprovalRequestSubject,
		to: to,
	});
};
