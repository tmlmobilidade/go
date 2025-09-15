'use client';

/* * */

import { RidesDetailViewOptions, useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Label, Section, SegmentedControl } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

export function RidesDetailViewNavigation() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Handle actions
	const handleChangeView = (value: keyof typeof RidesDetailViewOptions) => {
		console.log('value', value);
		ridesDetailContext.actions.setSelectedView(value);
	};

	//
	// C. Render components

	const renderViewsOptions = () => {
		return Object.values(RidesDetailViewOptions).map(option => ({
			label: (
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
					{React.createElement(option.icon)}
					{option.label}
				</Section>
			),
			value: option.value,
		}));
	};

	return (
		<Section alignItems="center" flexDirection="row" gap="xs" justifyContent="space-between" padding="sm">
			<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
				{React.createElement(RidesDetailViewOptions[ridesDetailContext.data.selected_view].icon, { size: 32 })}
				<Label size="lg" caps>{RidesDetailViewOptions[ridesDetailContext.data.selected_view].label}</Label>
			</Section>
			<SegmentedControl
				data={renderViewsOptions()}
				onChange={handleChangeView}
				size="sm"
				value={ridesDetailContext.data.selected_view}
			/>
		</Section>
	);

	//
}
