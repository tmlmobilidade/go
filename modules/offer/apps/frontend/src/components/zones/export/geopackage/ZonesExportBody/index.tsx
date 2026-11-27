'use client';

import { Button, ErrorDisplay, MultiSelect, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesExportFormContext } from '../ZonesExportForm.context';

/* * */

export function ZonesExportBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, error, form, options } = useZonesExportFormContext();

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="zone_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options}
						disabled={!capabilities?.editEnabled}
						error={fieldState.error?.message}
						label={t('zones:list.ZonesListExport.zones')}
						nothingFoundMessage={t('zones:list.ZonesListExport.no_matches')}
						onChange={field.onChange}
						placeholder={t('zones:list.ZonesListExport.placeholder')}
						value={field.value}
						w="100%"
					/>
				)}
			/>
			<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" justifyContent="space-between" padding="none">
				<Button
					disabled={!capabilities?.editEnabled || !options.length}
					label={t('zones:list.ZonesListExport.select_all')}
					onClick={() => form.setValue('zone_ids', options.map(option => option.value), { shouldDirty: true, shouldValidate: true })}
					variant="transparent"
				/>
			</Section>
		</Section>
	);
}
