export function formatLargeNumbers(num: number, toFixed: number = 2): string {
	if (!num) {
		return '0';
	}
	const scales = [
		{ value: 1e12, label: 'T' },
		{ value: 1e9, label: 'B' },
		{ value: 1e6, label: 'M' },
		{ value: 1e3, label: 'K' }
	];

	for (const scale of scales) {
		if (Math.abs(num) >= scale.value) {
			return (num / scale.value).toFixed(toFixed) + scale.label;
		}
	}

	return num.toFixed(toFixed);
}

export function formatText(text: string) {
	const words = text
		.replace(/([A-Z])/g, ' $1')
		.toLowerCase()
		.trim()
		.split(' ');
	return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
