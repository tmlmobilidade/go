'use client';

import { ErrorDisplay, MultiSelect, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesExportFormContext } from '../ZonesExportForm.context';

/* * */

export function ZonesExportBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { error, form, options } = useZonesExportFormContext();

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="zone_ids"
				render={({ field }) => (
					<MultiSelect
						data={options}
						description={t('zones:list.ZonesListExport.zones_description')}
						label={t('zones:list.ZonesListExport.select_label')}
						onChange={field.onChange}
						placeholder={t('zones:list.ZonesListExport.placeholder')}
						value={field.value}
						w="100%"
					/>
				)}
			/>
		</Section>
	);
}
