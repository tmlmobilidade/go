'use client';

import { LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, SegmentedControl, StandardFormController } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StopsDetailUpdateCoordinates } from '../../coordinates/StopsDetailUpdateCoordinates';
import { StopsDetailUpdateName } from '../../name/StopsDetailUpdateName';
import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

/* * */

export function StopsDetailSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Transform data

	const lifecycleStatusItems = useMemo(() => LifecycleStatusValues.map(value => ({
		label: t(`shared:status.lifecycle_status.${value}`),
		value: value,
	})), [t]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionGeneral.description')}
			title={t('default:stops.detail.SectionGeneral.title')}
		>

			<Section>
				<Grid columns="ab" gap="md" placeItems="start">
					<StopsDetailUpdateCoordinates />
					<StopsDetailUpdateName />
				</Grid>
			</Section>

			<Section>
				<Grid>
					<StandardFormController
						control={form.control}
						name="lifecycle_status"
						render={({ field }) => (
							<SegmentedControl
								data={lifecycleStatusItems}
								disabled={field.disabled}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);
}
