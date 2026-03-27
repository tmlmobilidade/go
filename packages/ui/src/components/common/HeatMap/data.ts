export const data = {
	// 2026 sample: UTC calendar days only (matches Mantine heatmap). Day index 1…n for a visible ramp.
	...(() => {
		const dates: { [date: string]: number } = {};
		const startUtc = Date.UTC(2026, 0, 1);
		const endUtc = Date.UTC(2026, 11, 31);
		for (let t = startUtc; t <= endUtc; t += 86400000) {
			const d = new Date(t);
			const month = String(d.getUTCMonth() + 1).padStart(2, '0');
			const day = String(d.getUTCDate()).padStart(2, '0');
			const datestr = `${d.getUTCFullYear()}-${month}-${day}`;
			dates[datestr] = 1;
		}
		return dates;
	})(),
};
