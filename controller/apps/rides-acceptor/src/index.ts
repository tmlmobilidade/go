import { type ChangeStreamDocument, rides } from '@tmlmobilidade/interfaces';
import { normalizeRide, type RideNormalized } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { Ride, RideAnalysis, RideAnalysisSummary } from '@tmlmobilidade/types';

async function main() {
	//
	console.log('Starting Rides Acceptor...');

	// 1. Check if ride as ended

	const ridesCollection = await rides.getCollection();

	ridesCollection
		.watch([], { fullDocument: 'updateLookup' })
		.on('change', (operation: ChangeStreamDocument<Ride>) => {
			if (operation.operationType !== 'update') {
				return;
			}

			console.log('Ride Updated: ', operation.fullDocument._id);

			const normalizedRide: RideNormalized = normalizeRide(operation.fullDocument);

			if (normalizedRide.operational_status === 'scheduled' || normalizedRide.operational_status === 'running') {
				return;
			}

			console.log('Ride Ended: ', normalizedRide._id);

			// Test
			function testRide(ride: RideNormalized, requiredTests: string[]): [boolean, RideAnalysisSummary] {
				const summaryEntries: [string, RideAnalysis][] = [];

				for (const test of requiredTests) {
					const analysis = ride.analysis[test] ?? { grade: 'fail', message: 'Test was not found for this ride', reason: test };
					summaryEntries.push([test, analysis]);
				}

				const requiredTestsSummary: RideAnalysisSummary = Object.fromEntries(summaryEntries);

				const allRequiredTestsArePass = requiredTests.every((test) => {
					const analysis = ride.analysis[test];
					return analysis?.grade === 'pass';
				});

				return [allRequiredTestsArePass, requiredTestsSummary];
			}

			const [allRequiredTestsArePass, requiredTestsSummary] = testRide(normalizedRide, ['AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP', 'SIMPLE_THREE_VEHICLE_EVENTS', 'SIMPLE_ONE_APEX_VALIDATION']);
			console.log('Ride Acceptance: ', normalizedRide._id, ' - ', allRequiredTestsArePass);
			console.log('Ride Acceptance Summary: ', requiredTestsSummary);
		});
}

//

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
