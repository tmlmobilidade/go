'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { useZonesData } from '@/components/zones/shared/use-zones-data';
import { IconRotate2, IconTicket } from '@tabler/icons-react';
import { IconButton, MultiSelect, StandardFormController } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnZones({ rowIndex }: { rowIndex: number }) {
	//

	// A. Setup variables

	const patternsDetailContext = usePatternDetailContext();

	//
	// B. Fetch data

	const { data: zones } = useZonesData();
	const zonesOptions = zones.map(zone => ({ label: zone.name, value: zone._id }));

	//
	// C. Handle actions

	const handleResetZones = () => {
		if (!patternsDetailContext.capabilities.editEnabled) return;
		if (patternsDetailContext.data.pattern.path) {
			const path = [...(patternsDetailContext.form.getValues().path ?? [])];
			path[rowIndex] = { ...path[rowIndex], zones: patternsDetailContext.data.pattern.path[rowIndex]?.zones ?? [] };
			patternsDetailContext.actions.applyChanges({ path });
		}
	};

	//
	// D. Render components

	return (
		<div className={styles.column}>
			<StandardFormController
				control={patternsDetailContext.form.control}
				name={`path.${rowIndex}.zones`}
				render={({ field, fieldState }) => (
					<MultiSelect
						{...field}
						data={zonesOptions}
						error={fieldState.error?.message}
						readOnly={!patternsDetailContext.capabilities.editEnabled}
						rightSection={<IconTicket size={20} />}
						value={field.value ?? []}
						w="100%"
						leftSection={(
							<IconButton
								color="gray"
								icon={<IconRotate2 size={20} />}
								isDisabled={!patternsDetailContext.capabilities.editEnabled}
								onClick={handleResetZones}
								variant="subtle"
							/>
						)}
						searchable
					/>
				)}
			/>
		</div>
	);

	//
}
