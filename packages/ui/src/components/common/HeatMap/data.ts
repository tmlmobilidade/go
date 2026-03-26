export const data = {
	// 2026 dates, generated, each assigned the value 1.
	...(() => {
		const dates: { [date: string]: number } = {};
		const startDate = new Date('2026-01-01');
		const endDate = new Date('2026-12-31');
		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			const datestr = `${d.getFullYear()}-${month}-${day}`;
			dates[datestr] = 1;
		}
		return dates;
	})(),
};
