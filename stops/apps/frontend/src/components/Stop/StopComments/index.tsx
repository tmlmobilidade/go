'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Button, Collapsible, Grid, Section, TextArea, useMeContext } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export default function StopComments() {
	//

	//
	// A. Setup variables

	const [value, setValue] = useState<string>('');

	const stopDetailContext = useStopDetailContext();
	const meContext = useMeContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Notas e Comentários"
		>
			<Section gap="md">
				{stopDetailContext.data.form.getValues().comments.map((comment, index: number) => {
					return (
						<Grid key={index} gap="md">
							<div>USER ID: {comment.user_id}</div>
							<TextArea
								className={styles.textArea}
								maxRows={10}
								minRows={4}
								placeholder="Construção planeada a..."
								value={comment.text}
								disabled
							/>
						</Grid>
					);
				})}

				<Grid gap="md">
					<TextArea
						className={styles.textArea}
						maxRows={10}
						minRows={4}
						onChange={e => setValue(e.target.value)}
						placeholder="Comente aqui..."
						value={value}
					/>

					<Button
						label="Submeter"
						variant="secondary"
						onClick={() => {
							stopDetailContext.actions.handleCommentsChange(meContext.data.user._id, value);
							setValue('');
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
