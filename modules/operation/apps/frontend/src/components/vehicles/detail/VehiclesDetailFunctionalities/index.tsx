// 'use client';

// import { Checkbox, Collapsible, Grid, Section, StandardFormController } from '@tmlmobilidade/ui';
// import { useTranslation } from 'react-i18next';

// import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

// /* * */

// export function VehiclesDetailFunctionalities() {
// 	//

// 	//
// 	// A. Setup variables

// 	const { t } = useTranslation();

// 	const { capabilities, form } = useVehiclesDetailFormContext();

// 	//
// 	// B. Render components

// 	return (
// 		<Collapsible
// 			description={t('default:vehicles.detail.VehiclesDetailFunctionalities.description')}
// 			title={t('default:vehicles.detail.VehiclesDetailFunctionalities.title')}
// 		>
// 			<Section>
// 				<Grid columns="a" gap="sm">
// 					{VehicleFunctionalitiesValues.map(fieldName => (
// 						<StandardFormController
// 							key={fieldName}
// 							control={form.control}
// 							name={fieldName}
// 							render={({ field }) => (
// 								 <Checkbox
// 									checked={!!field.value}
// 									disabled={!capabilities.editEnabled}
// 									label={t(`default:vehicles.detail.VehiclesDetailFunctionalities.fields.${fieldName}.label`)}
// 									onChange={event => field.onChange(event.currentTarget.checked)}
// 								/>
// 							)}
// 						/>
// 					))}
// 				</Grid>
// 			</Section>
// 		</Collapsible>
// 	);
// }
