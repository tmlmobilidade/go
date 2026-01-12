'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, ProposedChangesWrapper, Section, SegmentedControl, TextInput, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionGeneral() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const lifecycleStatusItems = LifecycleStatusSchema.options.map(value => ({
		label: t(`${Translations.LIFECYCLE_STATUS}.${value}`),
		value: value,
	}));

	//
	// C. Handle actions

	// const handlePlayPhoneticName = async () => {
	// 	if (typeof window !== 'undefined') {
	// 		const synth = window.speechSynthesis;
	// 		const utterance = new SpeechSynthesisUtterance(stopDetailContext.data.form.values.tts_name || '');
	// 		utterance.lang = 'pt';
	// 		synth.speak(utterance);
	// 	}
	// };

	//
	// D. Render components

	return (
		<Collapsible
			description={t('stops:stops.detail.SectionGeneral.description')}
			title={t('stops:stops.detail.SectionGeneral.title')}
			defaultOpen
		>

			<Section>
				<Grid columns="abcd" gap="md">
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.stop_id')} value={stopDetailContext.data.stop?._id ?? 'N/A'} bordered />
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.legacy_id')} value={stopDetailContext.data.stop?.legacy_id ?? 'N/A'} bordered />
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.latitude')} value={stopDetailContext.data.stop?.latitude ?? 'N/A'} bordered />
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.longitude')} value={stopDetailContext.data.stop?.longitude ?? 'N/A'} bordered />
				</Grid>
			</Section>

			<Section>
				<Grid>
					<SegmentedControl
						key={stopDetailContext.data.form.key('lifecycle_status')}
						data={lifecycleStatusItems}
						readOnly={stopDetailContext.flags.isReadOnly}
						value={stopDetailContext.data.form.values.lifecycle_status}
						{...stopDetailContext.data.form.getInputProps('lifecycle_status')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="a" gap="md">

					<ProposedChangesWrapper
						inputName="name"
						label={t('stops:stops.detail.SectionGeneral.fields.name')}
						relatedId={stopDetailContext.data.stop?._id}
						scope="stop"
					>
						<TextInput
							readOnly={stopDetailContext.flags.isReadOnly}
							{...stopDetailContext.data.form.getInputProps('name')}
						/>
					</ProposedChangesWrapper>

					<ProposedChangesWrapper
						inputName="new_name"
						label={t('stops:stops.detail.SectionGeneral.fields.new_name')}
						relatedId={stopDetailContext.data.stop?._id}
						scope="stop"
					>
						<TextInput
							readOnly={stopDetailContext.flags.isReadOnly}
							{...stopDetailContext.data.form.getInputProps('new_name')}
						/>
					</ProposedChangesWrapper>

				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.short_name')} value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'} bordered />
					<ValueDisplay label={t('stops:stops.detail.SectionGeneral.fields.tts_name')} value={stopDetailContext.data.form.getValues()?.tts_name ?? 'N/A'} bordered />
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
