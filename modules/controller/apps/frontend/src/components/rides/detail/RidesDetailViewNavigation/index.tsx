'use client';

/* * */

import { RidesDetailViewOptions, useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Permissions } from '@tmlmobilidade/go-lib';
import { Label, Section, SegmentedControl, useMeContext } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

export function RidesDetailViewNavigation() {
	//

	//
	// A. Setup variables
	const ridesDetailContext = useRidesDetailContext();
	const me = useMeContext();

	//
	// B. Handle actions
	const handleChangeView = (value: keyof typeof RidesDetailViewOptions) => {
		ridesDetailContext.actions.setSelectedView(value);
	};

	//
	// C. Render components

	const renderViewsOptions = () => {
		return Object.values(RidesDetailViewOptions).map(option => me.actions.hasPermission(Permissions.rides.scope, option.permission) && ({
			label: (
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
					{React.createElement(option.icon)}
					{option.label}
				</Section>
			),
			value: option.value,
		})).filter(Boolean);
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
