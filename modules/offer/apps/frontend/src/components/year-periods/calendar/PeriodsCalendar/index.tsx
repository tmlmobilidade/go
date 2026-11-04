'use client';

import { openAsignPeriodModal } from '@/components/year-periods/calendar/PeriodAssign.modal';
import { type CalendarKey } from '@tmlmobilidade/dates';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { EventsCalendar, useMeData } from '@tmlmobilidade/ui';

/* * */

export function PeriodsCalendar() {
	//

	//
	// A. Setup permissions

	const { data: me, error, isLoading } = useMeData();
	const canCreate = hasPermission(me?.permissions ?? [], { action: PermissionCatalog.all.year_periods.actions.create, scope: PermissionCatalog.all.year_periods.scope });
	const canUpdate = hasPermission(me?.permissions ?? [], { action: PermissionCatalog.all.year_periods.actions.update, scope: PermissionCatalog.all.year_periods.scope });
	const canAssign = !isLoading && !error && (canCreate || canUpdate);

	//
	// B. Handle range selection

	const handleRangeSelect = (range: { end: CalendarKey, start: CalendarKey }, clearSelection: () => void) => {
		openAsignPeriodModal(range, clearSelection);
	};

	//
	// C. Render component

	return (
		<EventsCalendar
			initialView="year"
			onRangeSelect={canAssign ? handleRangeSelect : undefined}
			showSidebar={false}
		/>
	);

	//
}
