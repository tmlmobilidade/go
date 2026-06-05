'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { FileComponent } from '@/components/common/FileComponent/index';
import { Collapsible, FileButton, Grid, Label, Section, Spacer, useToast } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function AgencySectionValidationRules() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleFileChange = (file: File) => {
		// Respect read-only / locked state
		if (agencyDetailContext.flags.isReadOnly) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.read_only.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.read_only.title'),
		});
		// Check if the file size is greater than 1MB
		if (file.size > MAX_FILE_SIZE) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.max_size.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.max_size.title'),
		});
		// Only allow JSON files
		if (!file.name.endsWith('.json')) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.file_type.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.file_type.title'),
		});
		// Read the file content
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const fileContent = JSON.parse(content);
				// Update form state with validation rules
				agencyDetailContext.form.instance.setValue('validation_rules', fileContent);
				// Show success message
				return useToast.success({
					message: t('default:agencies.detail.SectionValidationRules.toasts.success.message'),
					title: t('default:agencies.detail.SectionValidationRules.toasts.success.title'),
				});
			} catch {
				return useToast.error({
					message: t('default:agencies.detail.SectionValidationRules.toasts.error.message'),
					title: t('default:agencies.detail.SectionValidationRules.toasts.error.title'),
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
					{agencyDetailContext.data.agency.validation_rules ? (
						<FileComponent
							file={agencyDetailContext.data.agency.validation_rules}
							label={t('default:agencies.detail.SectionValidationRules.fields.file_content.button')}
						/>
					) : <Label>{t('default:agencies.detail.SectionValidationRules.fields.file_content.no_content')}</Label>}
				</Section>
			</Grid>
		</Collapsible>
	);
}
