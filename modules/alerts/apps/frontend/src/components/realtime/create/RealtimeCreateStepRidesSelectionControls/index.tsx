'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { Button, Grid, Section, SegmentedControl } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepRidesSelectionControls() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Render components

	return (
		<Section flexDirection="column" gap="md">
			<Grid columns="aab" gap="md">
				<SegmentedControl
					onChange={realtimeCreateContext.filters.view_mode.set}
					value={realtimeCreateContext.filters.view_mode.value}
					data={[
						{ label: 'Ver todas as circulações', value: 'all' },
						{ label: `Apenas as Selecionadas (${realtimeCreateContext.data.form.getValues().references?.length ?? 0})`, value: 'selected' },
					]}
				/>
				<Grid columns="ab" gap="md">
					<Button
						disabled={realtimeCreateContext.data.filtered_rides?.length === 0 || realtimeCreateContext.data.filtered_rides?.length > 10}
						label="Adicionar Todas"
						onClick={realtimeCreateContext.actions.selectVisibleRides}
						variant="primary"
					/>
					<Button
						disabled={realtimeCreateContext.data.form.getValues().references?.length === 0}
						label="Remover Seleção"
						onClick={realtimeCreateContext.actions.removeAllRides}
						variant="danger"
					/>
				</Grid>
			</Grid>
		</Section>
	);

	//
}
