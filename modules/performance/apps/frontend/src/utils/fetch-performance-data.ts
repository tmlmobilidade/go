import { fetchApiData } from '@tmlmobilidade/ui';

/** Existing Performance hooks consume the payload rather than the API envelope. */
export async function fetchPerformanceData<T>(url: string): Promise<T> {
	const response = await fetchApiData<T>({ url });
	if (response.error) throw new Error(response.error);
	if (response.data === null) throw new Error('Performance API returned no data');
	return response.data;
}
