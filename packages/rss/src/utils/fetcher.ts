/* * */

import { type Fetcher } from '@/types/fetcher.types.js';

export const fetcher = async ({ type }: Fetcher) => {
	//

	//
	// A.Setup variables

	const baseUrl = `https://api.cmet.pt/${type}`;

	//
	// B.Fetch data

	const response = await fetch(baseUrl);

	//
	// C.Return data

	return response.json();
};

/* * */
