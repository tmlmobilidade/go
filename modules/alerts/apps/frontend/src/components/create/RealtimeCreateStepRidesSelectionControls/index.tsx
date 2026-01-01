'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/create/RealtimeCreate.context';
import { Button, Grid, SegmentedControl, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepRidesSelectionControls() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Grid columns="aab" gap="md">
				<SegmentedControl
					onChange={realtimeCreateContext.filters.view_mode.set}
					value={realtimeCreateContext.filters.view_mode.value}
					data={[
						{ label: `Ver todas as circulações (${realtimeCreateContext.data.filtered_rides?.length ?? 0})`, value: 'all' },
						{ label: `Apenas as Selecionadas (${realtimeCreateContext.data.form.getValues().references?.length ?? 0})`, value: 'selected' },
					]}
				/>
				<Grid columns="ab" gap="md">
					<Button
						disabled={!realtimeCreateContext.data.form.getValues().references?.length}
						label="Confirmar Seleção"
						onClick={realtimeCreateContext.data.multi_step.next}
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
		</Toolbar>
	);

	//
}
