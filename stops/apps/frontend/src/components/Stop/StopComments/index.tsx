'use client';

import { Button, Collapsible, Grid, Section, TextArea, useMeContext } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export default function StopComments({ actions, data }) {
	//

	//
	// A. Setup variables

	const [value, setValue] = useState<string>('');

	const meContext = useMeContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Notas e Comentários"
		>
			<Section gap="md">
				{data.form.getValues().comments.map((comment, index: number) => {
					return (
						<Grid key={index} gap="md">
							<div>USER ID: {comment.user_id}</div>
							<TextArea
								className={styles.textArea}
								maxRows={10}
								minRows={4}
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
							if (value === '') return;
							actions.handleCommentsChange(meContext.data.user._id, value);
							setValue('');
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
