import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { getAlertTitleAndDescription } from '@/lib/translations';
import { CoordinatesInput, Description, Label, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

export function AlertBasicInfo() {
	//

	//
	// A. Setup variables

	const realtimeContext = useRealtimeCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create.stepSummary.alertBasicInfo' });
	const { t: tGlobal } = useTranslation('global');

	//
	// B. Render components
	return (
		<Section gap="md">
			<Label size="lg">{t('title')}</Label>
			<div>
				<Label size="md">{t('titleLabel')}</Label>
				<Description>{realtimeContext.data.form.values.title}</Description>
			</div>
			<div>
				<Label size="md">{t('descriptionLabel')}</Label>
				<Description>{realtimeContext.data.form.values.description}</Description>
			</div>
			{
				realtimeContext.data.form.values.effect === 'DETOUR' && realtimeContext.data.form.values.cause === 'CONSTRUCTION' && (
					<>
						<TextInput
							label={t('fields.detour')}
							placeholder={t('fields.detourPlaceholder')}
							value={realtimeContext.data.detour}
							onChange={(event) => {
								realtimeContext.actions.setDetour(event.target.value);
								const uniqueLineIds = Array.from(new Set(realtimeContext.data.selectedRides.map(ride => ride.line_id)));
								const { descriptionKey, params } = getAlertTitleAndDescription(realtimeContext.data.form.values.cause, realtimeContext.data.form.values.effect, uniqueLineIds.join(', '), event.target.value);
								const description = tGlobal(descriptionKey, params);
								realtimeContext.data.form.setFieldValue('description', description);
							}}
							withAsterisk
						/>
					</>
				)
			}
			<CoordinatesInput
				description={t('fields.coordinatesDescription')}
				{...realtimeContext.data.form.getInputProps('coordinates')}
			/>
		</Section>
	);
}
