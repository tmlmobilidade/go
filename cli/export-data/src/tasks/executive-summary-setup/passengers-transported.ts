import { type TaskProps } from '@/types.js';
import { yyyymmddToDashed } from '@/utils/dates-helper.js';
import { metrics } from '@tmlmobilidade/interfaces';
import { DemandByCategoryByAgencyByDay, DemandByProductByAgencyByDay } from '@tmlmobilidade/types';

/* * */

export interface DemandMetricResult {
	agencyId: string
	byCategory: Record<string, number>
	byProduct: Record<string, number>
	date: string
	totalpassengers: number
}

/* * */

export async function calculateDemandFromMetrics({ context, message }: TaskProps): Promise<DemandMetricResult[]> {
	message('A calcular procura a partir das métricas...');

	const metricsCollection = await metrics.getCollection();

	type RelevantMetricDoc = DemandByCategoryByAgencyByDay | DemandByProductByAgencyByDay;

	//
	// Fetch only relevant metrics
	message('A ir buscar métricas de procura...');
	const docs = await metricsCollection.find<RelevantMetricDoc>({
		metric: { $in: ['demand_by_product_by_agency_by_day', 'demand_by_category_by_agency_by_day'] },
	}).toArray();

	message(`Encontradas ${docs.length} métricas para processar`);

	const results = new Map<string, DemandMetricResult>(); // key = `${date}-${agencyId}`

	const startDate = yyyymmddToDashed(context.dates.start);
	const endDate = yyyymmddToDashed(context.dates.end);

	//
	// Process each metric document
	for (const doc of docs) {
		const agencyId = doc.properties.agency_id;
		const isProductMetric = doc.metric === 'demand_by_product_by_agency_by_day';

		for (const [date, dayData] of Object.entries(doc.data)) {
			if (date < startDate || date > endDate) continue;

			const key = `${date}-${agencyId}`;

			if (!results.has(key)) {
				results.set(key, {
					agencyId,
					byCategory: {},
					byProduct: {},
					date,
					totalpassengers: 0,
				});
			}

			const entry = results.get(key);
			const qty: number = dayData.qty;

			if (isProductMetric) {
				const productId = (doc as DemandByProductByAgencyByDay).properties.product_id;
				entry.byProduct[productId] = (entry.byProduct[productId] || 0) + qty;
			} else {
				const category = (doc as DemandByCategoryByAgencyByDay).properties.category;
				entry.byCategory[category] = (entry.byCategory[category] || 0) + qty;
			}
		}
	}

	//
	// Calculate totalpassengers from byProduct

	message('A calcular totais de passageiros...');
	for (const entry of results.values()) {
		entry.totalpassengers = Object.values(entry.byProduct).reduce((sum, v) => sum + v, 0);
	}

	message(`Processados ${results.size} registos de procura`);

	return Array.from(results.values());

	//
}
