'use client';

import { OperationalBannerKindSchema, OperationalBannerKindValues, OperationalBannerSeveritySchema, OperationalBannerSeverityValues } from '@tmlmobilidade/go-types-core';
import { Collapsible, Section, Select, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { ContentScope } from '../../../shared/ContentScope';
import { BANNER_SEVERITY_COLORS, BannerDisplayLabel, BannerKindIcon, BannerSeverityDot } from '../../shared/banner-display';
import { useBannersDetailFormContext } from '../BannersDetailForm.context';

/* * */

const kindIcon = (value: string) => <BannerKindIcon kind={OperationalBannerKindSchema.parse(value)} />;

/* * */

const severityDot = (value: string) => <BannerSeverityDot severity={OperationalBannerSeveritySchema.parse(value)} />;

/* * */

export function BannersDetailContent() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useBannersDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('default:dev.sections.content')} defaultOpen>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:dev.fields.title')}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value ?? ''}
							w="100%"
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="message"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label={t('default:dev.fields.message')}
							minRows={3}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value ?? ''}
							w="100%"
							autosize
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="kind"
					render={({ field, fieldState }) => (
						<Select
							clearable={false}
							data={OperationalBannerKindValues.map(value => ({ label: t(`default:dev.kinds.${value}`), value }))}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('default:dev.fields.kind')}
							leftSection={kindIcon(field.value)}
							renderOption={({ option }) => <BannerDisplayLabel icon={kindIcon(option.value)} label={option.label} />}
							value={field.value}
							w="100%"
							onChange={(value) => {
								if (value) field.onChange(OperationalBannerKindSchema.parse(value));
							}}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="severity"
					render={({ field, fieldState }) => (
						<Select
							clearable={false}
							data={OperationalBannerSeverityValues.map(value => ({ label: t(`default:dev.severities.${value}`), value }))}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('default:dev.fields.severity')}
							leftSection={severityDot(field.value)}
							value={field.value}
							w="100%"
							onChange={(value) => {
								if (value) field.onChange(OperationalBannerSeveritySchema.parse(value));
							}}
							renderOption={({ option }) => (
								<BannerDisplayLabel color={BANNER_SEVERITY_COLORS[OperationalBannerSeveritySchema.parse(option.value)]} icon={severityDot(option.value)} label={option.label} />
							)}
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="scope"
					render={({ field, fieldState }) => (
						<ContentScope disabled={!capabilities?.editEnabled} error={fieldState.error?.message} onChange={field.onChange} value={field.value} />
					)}
				/>
			</Section>
		</Collapsible>
	);
}
