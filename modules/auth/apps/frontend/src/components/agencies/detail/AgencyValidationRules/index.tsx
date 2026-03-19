'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { FileComponent } from '@/components/common/FileComponent/index';
import { Collapsible, FileButton, Grid, Label, Section, Spacer, useToast } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function AgencyValidationRules() {
	//

	//
	// A. Setup variables
	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleFileChange = (file: File) => {
		// Respect read-only / locked state
		if (agencyDetailContext.flags.isReadOnly) {
			useToast.error({
				message: t('default:agencies.detail.header.save'),
				title: t('default:agencies.detail.SectionValidationRules.title'),
			});
			return;
		}

		// Check if the file size is greater than 1MB
		if (file.size > MAX_FILE_SIZE) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar ficheiro',
			});
			return;
		}

		// Only allow JSON files
		if (!file.name.endsWith('.json')) {
			useToast.error({
				message: 'Apenas ficheiros JSON são suportados.',
				title: 'Tipo de ficheiro inválido',
			});
			return;
		}

		// Read the file content
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const fileContent = JSON.parse(content);

				// Update form state with validation rules
				agencyDetailContext.data.form.setFieldValue('validation_rules', fileContent);

				useToast.success({
					message: 'Regras de validação carregadas.',
					title: 'Regras carregadas',
				});
			} catch {
				useToast.error({
					message: 'Não foi possível ler o ficheiro JSON. Verifique o conteúdo.',
					title: 'Erro ao processar ficheiro',
				});
			}
		};
		reader.readAsText(file);
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionValidationRules.description')}
			title={t('default:agencies.detail.SectionValidationRules.title')}
		>
			<Grid columns="ab" gap="sm">
				<Section alignItems="center" gap="lg">
					<Label>{t('default:agencies.detail.SectionValidationRules.fields.file.label')}</Label>
					<Spacer />
					<FileButton
						accept="application/json"
						disabled={agencyDetailContext.flags.isReadOnly}
						label={t('default:agencies.detail.SectionValidationRules.fields.file.button')}
						onFileChange={handleFileChange}
					/>
				</Section>

				<Section alignItems="center" gap="sm">
					<Label>{t('default:agencies.detail.SectionValidationRules.fields.file_content.label')}</Label>
					{agencyDetailContext.data.agency.validation_rules ? (<FileComponent file={agencyDetailContext.data.agency.validation_rules} label={t('default:agencies.detail.SectionValidationRules.fields.file_content.button')} />) : (<Label>Nenhuma regra de validação definida</Label>)}
				</Section>
			</Grid>
		</Collapsible>
	);
}
