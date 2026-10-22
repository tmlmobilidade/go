'use client';

import { Collapsible, ErrorDisplay, MultiSelect, Section, Select, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesFaresData } from '../../shared/use-typologies-fares-data';
import { useTypologiesDetailFormContext } from '../TypologiesDetailForm.context';

/* * */

export function TypologyDetailSectionFares() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useTypologiesDetailFormContext();
	const { error, isLoading, onboardOptions, prepaidOptions } = useTypologiesFaresData();

	//
	// B. Render components

	return (
		<Collapsible title={t('default:typologies.sections.fares')}>
			<Section gap="md">
				{error && <ErrorDisplay message={error} />}

				<StandardFormController
					control={form.control}
					name="default_prepaid_fare_id"
					render={({ field, fieldState }) => (
						<Select
							data={prepaidOptions}
							disabled={!capabilities.editEnabled || isLoading || !!error}
							error={fieldState.error?.message}
							label={t('default:typologies.fields.default_prepaid_fare_id.label')}
							onChange={field.onChange}
							value={field.value ?? null}
							w="100%"
							clearable
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="default_onboard_fare_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={onboardOptions}
							disabled={!capabilities.editEnabled || isLoading || !!error}
							error={fieldState.error?.message}
							label={t('default:typologies.fields.default_onboard_fare_ids.label')}
							onChange={field.onChange}
							value={field.value ?? []}
							w="100%"

						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
