import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

export function CauseAndEffect() {
	//

	//
	// A. Setup Variables

	const realtimeContext = useRealtimeCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create.stepsCauseAndEffect' });

	//
	// B. Render Components

	return (
		<Section gap="md">
			<Label size="md" caps>{t('title')}</Label>
			<Section flexDirection="row" gap="md" padding="none">
				<Section flexDirection="row" gap="md" padding="none">
					{CauseIcons[realtimeContext.data.form.values.cause]}
					{Translations.CAUSE[realtimeContext.data.form.values.cause]}
				</Section>
				<Section flexDirection="row" gap="md" padding="none">
					{EffectIcons[realtimeContext.data.form.values.effect]}
					{Translations.EFFECT[realtimeContext.data.form.values.effect]}
				</Section>
			</Section>
		</Section>
	);

	//
}
