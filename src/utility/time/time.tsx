export function seconds(seconds: number): number {
	return seconds * 1000;
}

export function minutes(minutes: number): number {
	return seconds(minutes * 60);
}

export function hours(hours: number): number {
	return minutes(hours * 60);
}