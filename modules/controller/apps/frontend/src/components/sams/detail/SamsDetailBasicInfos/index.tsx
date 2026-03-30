/* * */

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { ErrorDisplay, Grid, Label, LoadingOverlay, Section } from '@tmlmobilidade/ui';

export function SamsDetailBasicInfos() {
	//

	//
	// A. Setup variables

	const samDetailContext = useSamsDetailContext();

	//
	// B. Render components

	if (samDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (samDetailContext.flags.error) {
		return <ErrorDisplay message={samDetailContext.flags.error.message} />;
	}

	return (
		<Section gap="md">
			<Grid columns="abc" gap="md">
				<Label>Descrição</Label>
			</Grid>
		</Section>
	);
}
