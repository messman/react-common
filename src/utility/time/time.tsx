/** Returns the seconds as milliseconds. */
export function seconds(seconds: number): number {
	return seconds * 1000;
}

/** Returns the minutes as milliseconds. */
export function minutes(minutes: number): number {
	return seconds(minutes * 60);
}

/** Returns the hours as milliseconds. */
export function hours(hours: number): number {
	return minutes(hours * 60);
}