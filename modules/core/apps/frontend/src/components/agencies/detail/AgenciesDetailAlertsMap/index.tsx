'use client';

import { type AlertCause, AlertCauseValues, type AlertEffect, AlertEffectValues, type AlertReferenceType, AlertReferenceTypeValues } from '@tmlmobilidade/go-types-operation';
import { Checkbox, Collapsible, Divider, Grid, Inline, Section, StandardFormController, Surface, Table } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailAlertsMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Handle actions

	const handleCauseClick = (causeValue: AlertCause) => {
		// Skip if the form is read-only
		if (!capabilities.editEnabled) return;
		// Count how many reference types are currently enabled,
		// to determine whether to set them all to false or all to true.
		let enabledCount = 0;
		for (const effectValue of AlertEffectValues) {
			for (const referenceTypeValue of AlertReferenceTypeValues) {
				const isEnabled = form.getValues(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`);
				if (isEnabled) enabledCount++;
			}
		}
		// If all reference types are currently enabled, set them all to false.
		// Otherwise, set them all to true.
		const newValue = enabledCount === (AlertEffectValues.length * AlertReferenceTypeValues.length) ? false : true;
		// Toggle the value of all reference types for the given cause and effect
		for (const effectValue of AlertEffectValues) {
			for (const referenceTypeValue of AlertReferenceTypeValues) {
				form.setValue(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`, newValue, { shouldDirty: true });
			}
		}
	};

	const handleEffectClick = (causeValue: AlertCause, effectValue: AlertEffect) => {
		// Skip if the form is read-only
		if (!capabilities.editEnabled) return;
		// Count how many reference types are currently enabled,
		// to determine whether to set them all to false or all to true.
		let enabledCount = 0;
		for (const referenceTypeValue of AlertReferenceTypeValues) {
			const isEnabled = form.getValues(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`);
			if (isEnabled) enabledCount++;
		}
		// If all reference types are currently enabled, set them all to false.
		// Otherwise, set them all to true.
		const newValue = enabledCount === AlertReferenceTypeValues.length ? false : true;
		// Toggle the value of all reference types for the given cause and effect
		for (const referenceTypeValue of AlertReferenceTypeValues) {
			form.setValue(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`, newValue, { shouldDirty: true });
		}
	};

	const handleReferenceTypeClick = (causeValue: AlertCause, referenceTypeValue: AlertReferenceType) => {
		// Skip if the form is read-only
		if (!capabilities.editEnabled) return;
		// Count how many reference types are currently enabled,
		// to determine whether to set them all to false or all to true.
		let enabledCount = 0;
		for (const effectValue of AlertEffectValues) {
			const isEnabled = form.getValues(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`);
			if (isEnabled) enabledCount++;
		}
		// If all reference types are currently enabled, set them all to false.
		// Otherwise, set them all to true.
		const newValue = enabledCount === AlertEffectValues.length ? false : true;
		// Toggle the value of all reference types for the given cause and effect
		for (const effectValue of AlertEffectValues) {
			form.setValue(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`, newValue, { shouldDirty: true });
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionAlertsMap.description')}
			title={t('default:agencies.detail.SectionAlertsMap.title')}
		>
			<Section gap="lg">
				<Grid columns="a" gap="lg">

					{AlertCauseValues.map(causeValue => (
						<Surface key={causeValue} variant="bordered">
							<Section key={causeValue} padding="none">
								<Section>
									<Inline onClick={() => handleCauseClick(causeValue)} dotted>{t(`shared:alerts.causes.${causeValue}.title`)}</Inline>
								</Section>
								<Divider />
								<Table highlightOnHover>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>{t('default:agencies.detail.SectionAlertsMap.table.header.effect')}</Table.Th>
											{AlertReferenceTypeValues.map(referenceTypeValue => (
												<Table.Th key={`${causeValue}-${referenceTypeValue}`}>
													<Inline onClick={() => handleReferenceTypeClick(causeValue, referenceTypeValue)} dotted>{t(`shared:alerts.reference_types.${referenceTypeValue}.title`)}</Inline>
												</Table.Th>
											))}
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{AlertEffectValues.map(effectValue => (
											<Table.Tr key={effectValue}>
												<Table.Td>
													<Inline onClick={() => handleEffectClick(causeValue, effectValue)} dotted>{t(`shared:alerts.effects.${effectValue}.title`)}</Inline>
												</Table.Td>
												{AlertReferenceTypeValues.map(referenceTypeValue => (
													<Table.Td key={`${causeValue}-${effectValue}-${referenceTypeValue}`}>
														<StandardFormController
															control={form.control}
															name={`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`}
															render={({ field, fieldState }) => (
																<Checkbox
																	checked={field.value}
																	error={fieldState.error?.message}
																	onChange={field.onChange}
																	readOnly={!capabilities.editEnabled}
																/>
															)}
														/>
													</Table.Td>
												))}
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</Section>
						</Surface>
					))}

				</Grid>
			</Section>
		</Collapsible>
	);
}
