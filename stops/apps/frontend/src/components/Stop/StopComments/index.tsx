'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Button, Collapsible, Grid, Section, TextArea } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export default function StopComments() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const [value, setValue] = useState<string>('');
	//
	// B. Render components

	useEffect(() => {
		console.log('Comment', value);
	}, [value]);

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Notas e Comentários"
		>
			<Section gap="md">
				{stopDetailContext.data.form.getValues().comments.map((comment, index) => {
					return (
						<Grid gap="md">
							<div key={index}>
								{/* <div>ID: {comment._id}</div> */}
								<div>USER ID: {comment.user_id}</div>
								{/* <div>Comment: {comment.text}</div> */}
								<TextArea
									className={styles.text_area}
									maxRows={10}
									minRows={4}
									placeholder="Construção planeada a..."
									// onChange={e => setComment(e.target.value)}
									value={comment.text}
									// {...stopDetailContext.data.form.getInputProps('observations')}
									disabled
								/>
							</div>
						</Grid>
					);
				})}

				<Grid gap="md">
					<TextArea
						className={styles.text_area}
						maxRows={10}
						minRows={4}
						onChange={e => setValue(e.target.value)}
						placeholder="Comente aqui..."
						// {...stopDetailContext.data.form.getInputProps('observations')}
						value={value}
					/>

					<Button
						label="Submeter"
						variant="secondary"
						onClick={() => {
							stopDetailContext.actions.handleCommentsChange('123', value);
							setValue('');
						}}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
