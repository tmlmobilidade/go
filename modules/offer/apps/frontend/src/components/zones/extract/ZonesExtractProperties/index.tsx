'use client';

import { OfferZonesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { ErrorDisplay, Grid, MultiSelect, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useZonesExtractAgenciesData } from '../use-zones-extract-agencies-data';
import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtractProperties() {
	const { t } = useTranslation();
	const { capabilities, form } = useZonesExtractFormContext();
	const { error, isLoading, options } = useZonesExtractAgenciesData();

	return (
		<Section gap="md">
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
			<Grid columns="ab" gap="md">
				<StandardFormController
					control={form.control}
					name="properties.agency_ids"
					render={({ field, fieldState }) => {
						const selectedValues: string[] = field.value ?? [];
						const areAllOptionsSelected = options.length > 0 && options.length === selectedValues.length && options.every(option => selectedValues.includes(option.value));

						return (
							<MultiSelect
								classNames={{ pillsList: styles.selectedFilters }}
								data={options}
								disabled={!capabilities?.editEnabled || isLoading}
								error={fieldState.error?.message}
								label={t('default:zones.extract.ZonesExtractProperties.fields.agency_ids.label')}
								onChange={field.onChange}
								placeholder={areAllOptionsSelected ? t('default:zones.extract.ZonesExtractProperties.no_filter') : t('default:zones.extract.ZonesExtractProperties.placeholder')}
								value={areAllOptionsSelected ? [] : selectedValues}
								w="100%"
							/>
						);
					}}
				/>
				<StandardFormController
					control={form.control}
					name="properties.search"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('default:zones.extract.ZonesExtractProperties.fields.search.label')}
							onChange={field.onChange}
							value={field.value ?? ''}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
