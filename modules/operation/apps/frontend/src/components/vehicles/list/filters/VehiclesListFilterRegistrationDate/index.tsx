'use client';

import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { DateInput, FilterWrapper, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListFilterRegistrationDate } from './use-vehicles-list-filter-registration-date';

/* * */

export function VehiclesListFilterRegistrationDate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterRegistrationDate = useVehiclesListFilterRegistrationDate();

	//
	// B. Render components

	return (
		<FilterWrapper
			active={filterRegistrationDate.isActive}
			label={t('default:vehicles.list.VehiclesListFilterRegistrationDate.label')}
		>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<DateInput
					label={t('default:vehicles.list.VehiclesListFilterRegistrationDate.start_date')}
					maxDate={filterRegistrationDate.value_end === null ? undefined : toCalendarDate(filterRegistrationDate.value_end)}
					onChange={filterRegistrationDate.setStart}
					popoverProps={{ withinPortal: false }}
					value={filterRegistrationDate.value_start}
					clearable
				/>
				<DateInput
					label={t('default:vehicles.list.VehiclesListFilterRegistrationDate.end_date')}
					minDate={filterRegistrationDate.value_start === null ? undefined : toCalendarDate(filterRegistrationDate.value_start)}
					onChange={filterRegistrationDate.setEnd}
					popoverProps={{ withinPortal: false }}
					value={filterRegistrationDate.value_end}
					clearable
				/>
			</Section>
		</FilterWrapper>
	);
}
