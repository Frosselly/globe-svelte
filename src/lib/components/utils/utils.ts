export function formatLargeNumbers(num: number): string {
	const scales = [
		{ value: 1e12, label: 'T' },
		{ value: 1e9, label: 'B' },
		{ value: 1e6, label: 'M' },
		{ value: 1e3, label: 'K' }
	];

	for (const scale of scales) {
		if (Math.abs(num) >= scale.value) {
			return (num / scale.value).toFixed(2) + scale.label;
		}
	}

	return num.toFixed(2);
}
