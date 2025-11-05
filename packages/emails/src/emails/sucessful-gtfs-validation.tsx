/* * */

import { EmailWrapper, styles, ValidationSummary } from '@/components/index.js';
import { Button, Hr, Section, Text } from '@react-email/components';
import { getAppConfig } from '@go/consts';
import { GtfsValidation, ProcessingStatus, UnixTimestamp } from '@go/types';

/* * */

export interface SucessfulGtfsValidationEmailProps {
	first_name: string
	validation: GtfsValidation
}

export function SucessfulGtfsValidationEmail({ first_name, validation }: SucessfulGtfsValidationEmailProps) {
	const go_link = getAppConfig('plans', 'frontend_url') + '/validations/' + validation._id;

	const totalWarnings = validation.summary?.total_warnings ?? 0;
	const hasData = validation.summary !== null && validation.summary !== undefined;

	return (
		<EmailWrapper preview="Validação GTFS realizada com sucesso">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{first_name}
					,
				</Text>

				<Text style={styles.text}>
					Excelentes notícias! A validação do GTFS foi concluída com sucesso.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<ValidationSummary hasData={hasData} isSuccessful totalErrors={0} totalWarnings={totalWarnings} />

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.text}>
					<strong>O que isto significa:</strong>
				</Text>

				<Text style={styles.text}>
					• O GTFS está estruturalmente correto.
					<br />
					• A validação está pronta para ser convertida para plano.
					{totalWarnings > 0 ? ' (considere resolver os avisos)' : ''}
				</Text>

				{totalWarnings > 0 && (
					<Text style={styles.textStyles.warning}>
						💡 Nota: Os avisos encontrados não impedem o funcionamento do sistema, mas a sua correção pode melhorar a qualidade dos dados.
					</Text>
				)}

				<Text style={styles.text}>
					Para ver os detalhes completos da validação
					{totalWarnings > 0 ? ' e verificar os avisos' : ''}
					, clique no botão abaixo:
				</Text>

				<Button href={go_link} style={styles.button}>
					Ver Relatório Completo
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
		total_errors: 0,
		total_warnings: 3,
	},
	updated_at: 1715328000 as UnixTimestamp,
	updated_by: '',
};

SucessfulGtfsValidationEmail.PreviewProps = {
	first_name: 'Josué',
	validation,
} as SucessfulGtfsValidationEmailProps;

export default SucessfulGtfsValidationEmail;
