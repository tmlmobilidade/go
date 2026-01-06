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

	const { t } = useTranslation('stops');
	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('stops.detail.SectionNotes.description')}
			title={t('stops.detail.SectionNotes.title')}
		>
			<Section>
				<Grid>
					<Textarea
						key={stopDetailContext.data.form.key('comments')}
						minRows={10}
						placeholder={t('stops.detail.SectionNotes.fields.comments_placeholder')}
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
