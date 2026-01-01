'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Button, Grid, SegmentedControl, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepRidesSelectionControls() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Grid columns="aab" gap="md">
				<SegmentedControl
					onChange={alertCreateContext.filters.view_mode.set}
					value={alertCreateContext.filters.view_mode.value}
					data={[
						{ label: `Ver todas as circulações (${alertCreateContext.data.filtered_rides?.length ?? 0})`, value: 'all' },
						{ label: `Apenas as Selecionadas (${alertCreateContext.data.form.getValues().references?.length ?? 0})`, value: 'selected' },
					]}
				/>
				<Grid columns="ab" gap="md">
					<Button
						disabled={!alertCreateContext.data.form.getValues().references?.length}
						label="Confirmar Seleção"
						onClick={alertCreateContext.data.multi_step.next}
						variant="primary"
					/>
					<Button
						disabled={alertCreateContext.data.form.getValues().references?.length === 0}
						label="Remover Seleção"
						onClick={alertCreateContext.actions.removeAllRides}
						variant="danger"
					/>
				</Grid>
			</Grid>
		</Toolbar>
	);

	//
}
