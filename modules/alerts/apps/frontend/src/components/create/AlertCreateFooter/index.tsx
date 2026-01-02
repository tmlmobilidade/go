'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateFooter() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>

			<Spacer />

			<Button
				disabled={alertCreateContext.data.multi_step.current === 'cause'}
				label="Voltar"
				onClick={alertCreateContext.data.multi_step.prev}
				variant="secondary"
			/>

			{alertCreateContext.data.multi_step.current !== 'summary' && (
				<Button
					disabled={!alertCreateContext.data.multi_step.isValid(alertCreateContext.data.multi_step.current)}
					label="Avançar"
					onClick={alertCreateContext.data.multi_step.next}
				/>
			)}

			{alertCreateContext.data.multi_step.current === 'summary' && (
				<Button
					disabled={!alertCreateContext.data.multi_step.isValid(alertCreateContext.data.multi_step.current)}
					label="Publicar"
					onClick={alertCreateContext.data.multi_step.next}
				/>
			)}

		</Toolbar>
	);

	//
}
