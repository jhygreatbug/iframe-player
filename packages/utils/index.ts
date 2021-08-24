import type { TPlayerEventData } from '@iframe-player/types';

function isObject(value: unknown): value is Object {
	const type = typeof value;
	return value != null && (type == 'object' || type == 'function');
}

export const isPlayerEventData = (data: unknown): data is TPlayerEventData =>
	isObject(data) && ('eventType' in data);

const getDecodeURIComponent = (s: string) => {
	try {
		return decodeURIComponent(s);
	} catch {
		return s;
	}
}

export function parseUrlSearchParams(search: string) {
	const params = search.replace(/^\?/, '').split('&');
	const result: Record<string, string> = {};
	params.forEach(item => {
		if (!item) {
			return;
		}
		const eqIndex = item.indexOf('=');

		if (eqIndex === -1) {
			const key = getDecodeURIComponent(item);
			result[key] = '';
			return;
		}

		const key = getDecodeURIComponent(item.slice(0, eqIndex));
		const val = getDecodeURIComponent(item.slice(eqIndex + 1));
		result[key] = val;
	});
	return result;
}
