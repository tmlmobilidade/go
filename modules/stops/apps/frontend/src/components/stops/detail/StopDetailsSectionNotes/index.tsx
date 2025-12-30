'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, Grid, Section, Textarea } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionNotes() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.notes' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid>
					<Textarea
						key={stopDetailContext.data.form.key('comments')}
						minRows={10}
						placeholder={t('fields.comments.placeholder')}
						readOnly={stopDetailContext.flags.isReadOnly}
						autosize
						{...stopDetailContext.data.form.getInputProps('comments')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
