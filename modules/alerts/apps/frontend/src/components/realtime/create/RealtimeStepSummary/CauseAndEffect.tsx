import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { Label, Section } from '@go/ui';

export function CauseAndEffect() {
	const realtimeContext = useRealtimeCreateContext();

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
					{Translations.EFFECT[realtimeContext.data.form.values.effect]}
				</Section>
			</Section>
		</Section>
	);
}
