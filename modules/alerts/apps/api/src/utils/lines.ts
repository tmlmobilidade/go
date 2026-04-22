import { Line } from '@carrismetropolitana/api-types/network';

const URL = 'https://api.carrismetropolitana.pt/v2/lines';

const fetchLines = async (): Promise<Line[]> => {
	const response = await fetch(URL);
	const data = await response.json();
	return data as Line[];
};

export { fetchLines };
