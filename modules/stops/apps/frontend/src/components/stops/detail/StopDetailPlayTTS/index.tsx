import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { audioTtsUrl } from '@/settings/urls.settings';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';

export function StopDetailPlayTTS() {
	//
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Handle actions

	const handlePlayTTS = () => {
		const ttsName = stopDetailContext.data.form.getValues()?.tts_name ?? '';
		const audio = new Audio(`${audioTtsUrl}/stops/${ttsName}.mp3`);
		audio.play();
	};

	//
	// C. Render components

	return (
		<Button label="Reproduzir TTS" onClick={handlePlayTTS} rightSection={<IconPlayerPlay size={16} />} />
	);

	//
}
