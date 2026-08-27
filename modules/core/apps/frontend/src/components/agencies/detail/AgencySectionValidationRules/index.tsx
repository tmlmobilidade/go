'use client';

import { SeverityStatusSchema, SeverityStatusValues } from '@tmlmobilidade/go-types-shared';
import { Button, Collapsible, Divider, FileButton, Grid, Label, Section, SegmentedControl, Spacer, Surface, Table, useStandardFormWatch, useToast } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { getNestedValidationRules, getValidationRuleSeverity, parseNestedValidationRules, updateValidationRuleSeverity } from './validation-rules';

/* * */

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function AgencySectionValidationRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	const validationRulesValue = useStandardFormWatch({ control: form.control, name: 'validation_rules' });
	const validationRules = getNestedValidationRules(validationRulesValue);

	//
	// B. Transform data

	const availableOptions = SeverityStatusValues.map(value => ({ label: value, value }));
	const rules = Object.entries(validationRules).flatMap(([groupName, groupRules]) => (
		Object.entries(groupRules).map(([ruleId, ruleConfig]) => ({
			groupName,
			ruleId,
			severity: getValidationRuleSeverity(ruleConfig),
		}))
	));

	//
	// C. Handle actions

	const handleSeverityChange = (groupName: string, ruleId: string, value: string) => {
		if (!capabilities.editEnabled) return;

		const severityResult = SeverityStatusSchema.safeParse(value);
		if (!severityResult.success) return;

		const currentRules = getNestedValidationRules(form.getValues('validation_rules'));
		const updatedRules = updateValidationRuleSeverity(currentRules, groupName, ruleId, severityResult.data);

		form.setValue('validation_rules', updatedRules, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	};

	const handleFileChange = (file: File) => {
		if (!capabilities.editEnabled) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.read_only.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.read_only.title'),
		});

		if (file.size > MAX_FILE_SIZE) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.max_size.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.max_size.title'),
		});

		if (!file.name.toLowerCase().endsWith('.json')) return useToast.error({
			message: t('default:agencies.detail.SectionValidationRules.toasts.file_type.message'),
			title: t('default:agencies.detail.SectionValidationRules.toasts.file_type.title'),
		});

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const fileContent = JSON.parse(String(event.target?.result));
				const parsedRules = parseNestedValidationRules(fileContent);
				if (!parsedRules) throw new Error('Invalid nested validation rules');

				form.setValue('validation_rules', parsedRules, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});

				useToast.success({
					message: t('default:agencies.detail.SectionValidationRules.toasts.success.message'),
					title: t('default:agencies.detail.SectionValidationRules.toasts.success.title'),
				});
			} catch {
				useToast.error({
					message: t('default:agencies.detail.SectionValidationRules.toasts.error.message'),
					title: t('default:agencies.detail.SectionValidationRules.toasts.error.title'),
				});
			}
		};
		reader.readAsText(file);
	};

	const handleDownload = () => {
		const currentRules = getNestedValidationRules(form.getValues('validation_rules'));
		const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(currentRules, null, 2)], { type: 'application/json' }));
		const downloadLink = document.createElement('a');

		downloadLink.href = blobUrl;
		downloadLink.download = `${form.getValues('short_name') || form.getValues('name') || 'agency'}-validation-rules.json`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		downloadLink.remove();
		setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
	};

	//
	// D. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionValidationRules.description')}
			title={t('default:agencies.detail.SectionValidationRules.title.GTFS_validation_rules.title')}
		>
			<Grid columns="ab" gap="sm">
				<Section alignItems="center" gap="lg">
					<Label>{t('default:agencies.detail.SectionValidationRules.fields.file.label')}</Label>
					<Spacer />
					<FileButton
						accept="application/json"
						disabled={!capabilities.editEnabled}
						label={t('default:agencies.detail.SectionValidationRules.fields.file.button')}
						onFileChange={handleFileChange}
					/>
				</Section>

				<Section alignItems="center" gap="lg">
					<Label>{t('default:agencies.detail.SectionValidationRules.fields.file_content.label')}</Label>
					<Spacer />
					<Button
						label={t('default:agencies.detail.SectionValidationRules.fields.file_content.button')}
						onClick={handleDownload}
						variant="secondary"
					/>
				</Section>
			</Grid>

			<Section padding="lg">
				<Grid columns="a" gap="lg">
					<Surface variant="bordered">
						<Divider />
						<Table highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('default:agencies.detail.SectionValidationRules.fields.Rules.label')}</Table.Th>
									<Table.Th>{t('default:agencies.detail.SectionValidationRules.fields.Severity.label')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rules.map(rule => (
									<Table.Tr key={`${rule.groupName}.${rule.ruleId}`}>
										<Table.Td>{`${rule.groupName}.${rule.ruleId}`}</Table.Td>
										<Table.Td>
											<SegmentedControl
												data={availableOptions}
												onChange={value => handleSeverityChange(rule.groupName, rule.ruleId, value)}
												readOnly={!capabilities.editEnabled}
												value={rule.severity}
												fullWidth
											/>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Surface>
				</Grid>
			</Section>
		</Collapsible>
	);
	//
}
