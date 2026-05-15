'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { AlertCause, AlertCauseValues, AlertEffect, AlertEffectValues, AlertReferenceTypeValues } from '@tmlmobilidade/types';
import { Button, Checkbox, Collapsible, ContextFormController, Grid, Inline, Label, Section, Surface, Table } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionAlertsMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Transform data

	//
	// B. Handle actions

	const handleCauseClick = (causeValue: AlertCause) => {
		// Skip if the form is read-only
		if (agencyDetailContext.flags.isReadOnly) return;
		// Toggle the value of all reference types for the given cause and effect
		for (const effectValue of AlertEffectValues) {
			for (const referenceTypeValue of AlertReferenceTypeValues) {
				const currentValue = agencyDetailContext.form.instance.getValues(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`);
				agencyDetailContext.form.instance.setValue(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`, currentValue ? false : true);
			}
		}
	};

	const handleEffectClick = (causeValue: AlertCause, effectValue: AlertEffect) => {
		// Skip if the form is read-only
		if (agencyDetailContext.flags.isReadOnly) return;
		// Count how many reference types are currently true for the given cause and effect,
		// to determine whether to set them all to false or all to true.
		let trueCount = 0;
		for (const referenceTypeValue of AlertReferenceTypeValues) {
			if (agencyDetailContext.form.instance.getValues(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`)) {
				trueCount++;
			}
		}
		// If all reference types are currently true, set them all to false. Otherwise, set them all to true.
		const newValue = trueCount === AlertReferenceTypeValues.length ? false : true;
		// Toggle the value of all reference types for the given cause and effect
		for (const referenceTypeValue of AlertReferenceTypeValues) {
			agencyDetailContext.form.instance.setValue(`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`, newValue);
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionAlertsMap.description')}
			title={t('default:agencies.detail.SectionAlertsMap.title')}
			defaultOpen
		>
			<Section gap="lg">
				<Grid columns="a" gap="lg">
					{AlertCauseValues.map(causeValue => (
						<Surface key={causeValue} variant="bordered">
							<Section key={causeValue} gap="lg">
								<Label>{causeValue}</Label>
								<Button onClick={() => handleCauseClick(causeValue)}>{causeValue}</Button>
								<Table>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Effect</Table.Th>
											{AlertReferenceTypeValues.map(referenceTypeValue => (
												<Table.Th key={`${causeValue}-${referenceTypeValue}`}>{referenceTypeValue}</Table.Th>
											))}
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{AlertEffectValues.map(effectValue => (
											<Table.Tr key={effectValue}>
												<Table.Td>
													<Inline onClick={() => handleEffectClick(causeValue, effectValue)} dotted>{effectValue}</Inline>
												</Table.Td>
												{AlertReferenceTypeValues.map(referenceTypeValue => (
													<Table.Td key={`${causeValue}-${effectValue}-${referenceTypeValue}`}>
														<ContextFormController
															control={agencyDetailContext.form.instance.control}
															name={`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`}
															render={({ field, fieldState }) => (
																<Checkbox
																	checked={field.value ?? false}
																	error={fieldState.error?.message}
																	onChange={field.onChange}
																	readOnly={agencyDetailContext.flags.isReadOnly}
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

	//
}
