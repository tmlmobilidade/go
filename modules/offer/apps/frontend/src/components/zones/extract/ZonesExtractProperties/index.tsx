'use client';

import { OfferZonesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { ErrorDisplay, MultiSelect, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesExtractAgenciesData } from '../use-zones-extract-agencies-data';
import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtractProperties() {
	const { t } = useTranslation();
	const { capabilities, form } = useZonesExtractFormContext();
	const { error, isLoading, options } = useZonesExtractAgenciesData();

	return (
		<>
			<Section>
				{error && <ErrorDisplay message={error} />}
				<StandardFormController
					control={form.control}
					name="version"
					render={({ field, fieldState }) => (
						<Select
							clearable={false}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('default:zones.extract.ZonesExtractProperties.fields.version.label')}
							onChange={field.onChange}
							value={field.value}
							data={[
								{ label: t('shared:extractions.versions.offer-zones-v1.title'), value: OfferZonesV1ExtractionVersionValue },
							]}
						/>
					)}
				/>
			</Section>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="properties.agency_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={options}
							disabled={!capabilities?.editEnabled || isLoading}
							error={fieldState.error?.message}
							label={t('default:zones.extract.ZonesExtractProperties.fields.agency_ids.label')}
							onChange={field.onChange}
							placeholder={t('default:zones.extract.ZonesExtractProperties.placeholder')}
							value={field.value ?? []}
							w="100%"
							withAsterisk
						/>
					)}
				/>
			</Section>
		</>
	);
}
