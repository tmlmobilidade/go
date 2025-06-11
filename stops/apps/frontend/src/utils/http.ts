export const unauthenticatedFetcher = async (url: string) => {
	const res = await fetch(url, { credentials: 'omit' });
	const data = await res.json();
	if (!res.ok) throw new Error(data.message);
	return data;
};
