import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { Label, Section } from '@tmlmobilidade/ui';

export function CauseAndEffect() {
	const realtimeContext = useRealtimeDetailContext();

	return (
		<Section gap="md">
			<Label size="md" caps>Causa e Efeito</Label>
			<Section flexDirection="row" gap="md" padding="none">
				<Section flexDirection="row" gap="md" padding="none">
					{CauseIcons[realtimeContext.data.form.values.cause]}
					{Translations.CAUSE[realtimeContext.data.form.values.cause]}
				</Section>
				<Section flexDirection="row" gap="md" padding="none">
					{EffectIcons[realtimeContext.data.form.values.effect]}
					{Translations.CAUSE[realtimeContext.data.form.values.effect]}
				</Section>
			</Section>
		</Section>
	);
}
