import { Text } from '@react-email/components';

import { HighlightText } from './highlight-text.js';
import { InfoBox } from './info-box.js';
import styles from './styles.js';

export interface ValidationSummaryProps {
	hasData?: boolean
	isSuccessful: boolean
	totalErrors?: number
	totalWarnings?: number
}

export function ValidationSummary({
	hasData = false,
	isSuccessful,
	totalErrors = 0,
	totalWarnings = 0,
}: ValidationSummaryProps) {
	const variant = isSuccessful ? 'success' : 'error';
	const title = isSuccessful ? '✅ Resumo da Validação' : '📋 Resumo da Validação';

	if (!hasData) {
		return (
			<InfoBox variant={variant}>
				<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
					{isSuccessful ? '✅ Validação Concluída' : '📋 Validação Concluída'}
				</Text>
				<Text style={{ ...styles.text, margin: '8px 0' }}>
					🎉
					{' '}
					<HighlightText variant={isSuccessful ? 'success' : 'error'}>
						Validação concluída
						{' '}
						{isSuccessful ? 'com sucesso' : 'com problemas'}
						!
					</HighlightText>
				</Text>
			</InfoBox>
		);
	}

	return (
		<InfoBox variant={variant}>
			<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
				{title}
			</Text>

			{isSuccessful ? (
				<Text style={{ ...styles.text, margin: '8px 0' }}>
					🎉
					{' '}
					<HighlightText variant="success">
						Validação concluída com sucesso!
					</HighlightText>
				</Text>
			) : null}

			{totalErrors > 0 && (
				<Text style={{ ...styles.text, margin: '8px 0' }}>
					❌
					{' '}
					<HighlightText variant="error">
						{totalErrors}
						{' '}
						erro
						{totalErrors !== 1 ? 's' : ''}
					</HighlightText>
					{' '}
					crítico
					{totalErrors !== 1 ? 's' : ''}
					{' '}
					encontrado
					{totalErrors !== 1 ? 's' : ''}
				</Text>
			)}

			{totalWarnings > 0 && (
				<Text style={{ ...styles.text, margin: '8px 0' }}>
					⚠️
					{' '}
					<HighlightText variant="warning">
						{totalWarnings}
						{' '}
						aviso
						{totalWarnings !== 1 ? 's' : ''}
					</HighlightText>
					{' '}
					encontrado
					{totalWarnings !== 1 ? 's' : ''}
					{!isSuccessful ? '' : ' (não crítico' + (totalWarnings !== 1 ? 's' : '') + ')'}
				</Text>
			)}

			{isSuccessful && totalWarnings === 0 && (
				<Text style={{ ...styles.text, color: '#16A34A', margin: '8px 0' }}>
					✨ Nenhum erro ou aviso encontrado - arquivo perfeito!
				</Text>
			)}

			{!isSuccessful && totalErrors === 0 && totalWarnings === 0 && (
				<Text style={{ ...styles.text, fontStyle: 'italic', margin: '8px 0' }}>
					Nenhum erro ou aviso específico foi reportado.
				</Text>
			)}
		</InfoBox>
	);
}
