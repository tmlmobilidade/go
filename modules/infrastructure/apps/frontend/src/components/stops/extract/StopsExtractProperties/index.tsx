'use client';

import { useStopsLocationsData } from '@/components/stops/shared/use-stops-locations-data';
import { InfrastructureNodesV1ExtractionVersionValue, InfrastructureStopsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { MultiSelect, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsExtractFormContext } from '../StopsExtractForm.context';

/* * */

export function StopsExtractProperties() {
	const { t } = useTranslation();
	const { capabilities, form } = useStopsExtractFormContext();
	const { isLoading, options } = useStopsLocationsData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.export], scope: PermissionCatalog.all.stops.scope },
	});

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="version"
				render={({ field, fieldState }) => (
					<Select
						clearable={false}
						disabled={!capabilities?.editEnabled}
						error={fieldState.error?.message}
						label={t('default:stops.extract.StopsExtractProperties.fields.version.label')}
						onChange={field.onChange}
						value={field.value}
						data={[
							{ label: t('shared:extractions.versions.infrastructure-stops-v1.title'), value: InfrastructureStopsV1ExtractionVersionValue },
							{ label: t('shared:extractions.versions.infrastructure-nodes-v1.title'), value: InfrastructureNodesV1ExtractionVersionValue },
						]}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="properties.municipality_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options.secondary}
						disabled={!capabilities?.editEnabled || isLoading}
						error={fieldState.error?.message}
						label={t('default:stops.extract.StopsExtractProperties.fields.municipality_ids.label')}
						onChange={field.onChange}
						placeholder={t('default:stops.extract.StopsExtractProperties.fields.municipality_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>
		</Section>
	);
}
