/* * */

import { DemandByAgencyByDay } from '@/components/visualizations/DemandByAgencyByDay';
import { DemandByAgencyComparison } from '@/components/visualizations/DemandByAgencyComparison';
import { TopMeanDemandByLineByMonth } from '@/components/visualizations/TopMeanDemandByLineByMonth';
import { Grid } from '@tmlmobilidade/ui';

export default function SupplyDemandTopic() {
	//

	// A. Setup variables

	//
	// B. Transform data

	// C. Render components

	return (
		<Grid columns="ab" gap="lg">
			<DemandByAgencyComparison chartType="line" height={400} />
			<TopMeanDemandByLineByMonth height={400} />

			<DemandByAgencyByDay chartType="bar" height={400} isInsideFrame />
		</Grid>
	);
}

//
