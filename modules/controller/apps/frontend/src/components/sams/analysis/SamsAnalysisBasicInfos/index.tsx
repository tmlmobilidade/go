/* * */

import { useSamsAnalysisContext } from '@/contexts/SamsAnalysis.context';
import { ErrorDisplay, Grid, Label, LoadingOverlay, Section, ValueDisplay } from '@tmlmobilidade/ui';

export function SamsAnalysisBasicInfos() {
	//

	//
	// A. Setup variables

	const samAnalysisContext = useSamsAnalysisContext();

	//
	// B. Render components

	if (samAnalysisContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (samAnalysisContext.flags.error) {
		return <ErrorDisplay message={samAnalysisContext.flags.error.message} />;
	}

	return (
		<Section gap="md">
			<Grid columns="abc" gap="md">
				<Label>Descrição</Label>
			</Grid>
		</Section>
	);
}
