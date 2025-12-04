'use client';

/* * */

import { RideAnalysisViewOptions, useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Label, Section, SegmentedControl, useMeContext } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

export function RideAnalysisViewNavigation() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const me = useMeContext();

	//
	// B. Handle actions

	const handleChangeView = (value: keyof typeof RideAnalysisViewOptions) => {
		RideAnalysisContext.actions.setSelectedView(value);
	};

	//
	// C. Render components

	const renderViewsOptions = () => {
		return Object.values(RideAnalysisViewOptions).map(option => me.actions.hasPermission(PermissionCatalog.all.rides.scope, option.permission) && ({
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
				{React.createElement(RideAnalysisViewOptions[RideAnalysisContext.data.selected_view].icon, { size: 32 })}
				<Label size="lg" caps>{RideAnalysisViewOptions[RideAnalysisContext.data.selected_view].label}</Label>
			</Section>
			<SegmentedControl
				data={renderViewsOptions()}
				onChange={handleChangeView}
				size="sm"
				value={RideAnalysisContext.data.selected_view}
			/>
		</Section>
	);

	//
}
