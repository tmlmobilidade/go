'use client';

import { SelectAllButton } from '@/components/common/SelectAllButton';
import { ErrorDisplay, Flex, Group, MultiSelect, Section, StandardFormController, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtractBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { error, form, options } = useZonesExtractFormContext();

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;

	return (
		<StandardFormController
			control={form.control}
			name="zone_ids"
			render={({ field }) => (
				<Section gap="xs">
					<Group align="center" gap="sm" w="100%" wrap="nowrap">
						<Flex direction="column" flex={1} fw={600} fz="sm" gap={2} miw={0}>
							<label>{t('zones:list.ZonesListExport.select_label')}</label>
							<Text c="var(--color-system-text-200)" size="xs">
								<span>{t('zones:list.ZonesListExport.zones_description')}</span>
							</Text>
						</Flex>
						<SelectAllButton
							label={t('zones:list.ZonesListExport.select_all')}
							onChange={field.onChange}
							selectedValues={field.value}
							values={options.map(zone => zone.value)}
						/>
					</Group>

					<MultiSelect
						data={options}
						onChange={field.onChange}
						placeholder={t('zones:list.ZonesListExport.placeholder')}
						value={field.value}
						w="100%"
					/>
				</Section>
			)}
		/>
	);
}
