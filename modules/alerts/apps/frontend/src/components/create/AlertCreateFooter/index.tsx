'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Button, PublishStatusTag, Spacer, Toolbar } from '@tmlmobilidade/ui';

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

			<PublishStatusTag
				onChange={value => alertCreateContext.data.form.setFieldValue('publish_status', value)}
				value={alertCreateContext.data.form.values.publish_status}
			/>

			<Spacer />

			<Button
				disabled={alertCreateContext.data.multi_step.progress.current?.id === 'cause'}
				label="Voltar"
				onClick={alertCreateContext.data.multi_step.actions.prev}
				variant="secondary"
			/>

			{alertCreateContext.data.multi_step.progress.current?.id !== 'summary' && (
				<Button
					disabled={!alertCreateContext.data.multi_step.progress.current?.isValid}
					label="Avançar"
					onClick={alertCreateContext.data.multi_step.actions.next}
				/>
			)}

			{alertCreateContext.data.multi_step.progress.current?.id === 'summary' && (
				<Button
					disabled={!alertCreateContext.data.multi_step.progress.current?.isValid}
					label="Publicar"
					onClick={alertCreateContext.actions.create}
				/>
			)}

		</Toolbar>
	);

	//
}
