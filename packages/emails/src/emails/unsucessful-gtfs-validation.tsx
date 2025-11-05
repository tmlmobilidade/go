/* * */

import { EmailWrapper, styles, ValidationSummary } from '@/components/index.js';
import { Button, Hr, Section, Text } from '@react-email/components';
import { getAppConfig } from '@tmlmobilidade/go-lib';
import { GtfsValidation, ProcessingStatus, UnixTimestamp } from '@tmlmobilidade/go-types';

/* * */

export interface UnsuccessfulGtfsValidationEmailProps {
	first_name: string
	validation: GtfsValidation
}

export function UnsuccessfulGtfsValidationEmail({ first_name, validation }: UnsuccessfulGtfsValidationEmailProps) {
	const go_link = getAppConfig('plans', 'frontend_url') + '/validations/' + validation._id;

	// Safe access to validation summary with fallbacks
	const totalErrors = validation.summary?.total_errors ?? 0;
	const totalWarnings = validation.summary?.total_warnings ?? 0;
	const hasData = validation.summary !== null && validation.summary !== undefined;

	return (
		<EmailWrapper preview="Validação GTFS com erros">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{first_name}
					,
				</Text>

				<Text style={styles.text}>
					A validação GTFS do seu arquivo foi concluída, mas foram encontrados problemas.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<ValidationSummary hasData={hasData} isSuccessful={false} totalErrors={totalErrors} totalWarnings={totalWarnings} />

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.text}>
					<strong>O que fazer agora:</strong>
				</Text>

				<Text style={styles.text}>
					• Reveja e corrija os problemas identificados
					<br />
					• Faça o upload do arquivo corrigido para nova validação
				</Text>

				{totalErrors > 0 && (
					<Text style={styles.text}>
						<strong>⚠️ Importante</strong>
						: Erros formais impedem o carregamento do ficheiro GTFS e devem ser corrigidos antes da publicação.
					</Text>
				)}

				<Text style={styles.text}>
					Para ver os detalhes completos da validação e corrigir os problemas, clique no botão abaixo:
				</Text>

				<Button href={go_link} style={styles.button}>
					Ver Detalhes da Validação
				</Button>
			</Section>
		</EmailWrapper>
	);
};

const validation: GtfsValidation = {
	_id: '123',
	created_at: 1715328000 as UnixTimestamp,
	created_by: '',
	feeder_status: 'success' as ProcessingStatus,
	file_id: '123',
	gtfs_agency: {
		agency_id: '123',
		agency_name: 'Test Agency',
		agency_timezone: 'Europe/Lisbon',
	},
	gtfs_feed_info: {
		feed_lang: 'en',
	},
	notification_sent: false,
	summary: {
		messages: [],
		total_errors: 4,
		total_warnings: 3,
	},
	updated_at: 1715328000 as UnixTimestamp,
	updated_by: '',
};

UnsuccessfulGtfsValidationEmail.PreviewProps = {
	first_name: 'Josué',
	validation,
} as UnsuccessfulGtfsValidationEmailProps;

export default UnsuccessfulGtfsValidationEmail;
