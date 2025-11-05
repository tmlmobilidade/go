import { EmailWrapper, InfoBox, styles } from '@/components/index.js';
import { getAppConfig } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate, type Plan, type UnixTimestamp } from '@tmlmobilidade/types';
import { Button, Hr, Section, Text } from '@react-email/components';

export interface PlanApprovedEmailProps {
	first_name: string
	plan: Plan
}

export function PlanApprovedEmail({ first_name, plan }: PlanApprovedEmailProps) {
	const go_link = getAppConfig('plans', 'frontend_url') + '/plans/' + plan._id;

	return (
		<EmailWrapper preview="Plano aprovado com sucesso">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{first_name}
					,
				</Text>

				<Text style={styles.text}>
					Excelentes notícias! O seu plano foi aprovado e está agora disponível para publicação.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="success">
					<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
						✅ Plano Aprovado
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>ID do Plano:</strong>
						{' '}
						{plan._id}
						<br />
						<strong>Agência:</strong>
						{' '}
						{plan.gtfs_agency?.agency_name || 'Não especificada'}
						<br />
						<strong>Data de Aprovação:</strong>
						{' '}
						{new Date().toLocaleDateString('pt-PT')}
					</Text>
				</InfoBox>

				<InfoBox variant="info">
					<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
						📅 Data de publicação
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>Data de início:</strong>
						{' '}
						{Dates.fromOperationalDate(plan.gtfs_feed_info?.feed_start_date as OperationalDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>Data de fim:</strong>
						{' '}
						{Dates.fromOperationalDate(plan.gtfs_feed_info?.feed_end_date as OperationalDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
					</Text>
				</InfoBox>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.text}>
					<strong>O que isto significa:</strong>
				</Text>

				<Text style={styles.text}>
					• O plano passou por todas as validações necessárias
					<br />
					• Os dados serão automaticamente publicados para os sistemas de informação
				</Text>

				<Text style={styles.text}>
					Para ver os detalhes completos do seu plano aprovado, clique no botão abaixo:
				</Text>

				<Button href={go_link} style={styles.button}>
					Ver Plano Aprovado
				</Button>
			</Section>
		</EmailWrapper>
	);
};

const mockPlan: Plan = {
	_id: '64f8b2a3c1d2e3f4a5b6c7d8',
	controller: {
		last_hash: 'abcdef1234567890',
		status: 'complete',
		timestamp: 1715328000 as UnixTimestamp,
	},
	created_at: 1715328000 as UnixTimestamp,
	created_by: '',
	gtfs_agency: {
		agency_id: 'TML001',
		agency_name: 'Transportes Metropolitanos de Lisboa',
		agency_timezone: 'Europe/Lisbon',
	},
	gtfs_feed_info: {
		feed_end_date: '20241231' as OperationalDate,
		feed_lang: 'pt',
		feed_start_date: '20240101' as OperationalDate,
	},
	hash: '1234567890',
	is_locked: false,
	operation_file_id: '64f8b2a3c1d2e3f4a5b6c7d9',
	pcgi_legacy: {
		operation_plan_id: '123',
	},
	status_merger: 'complete',
	updated_at: 1715328000 as UnixTimestamp,
	updated_by: '',
};

PlanApprovedEmail.PreviewProps = {
	first_name: 'Josué',
	plan: mockPlan,
} as PlanApprovedEmailProps;

export default PlanApprovedEmail;
