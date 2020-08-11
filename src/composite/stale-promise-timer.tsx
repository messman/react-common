import * as React from 'react';
import { useDataControlledPromise, DataControlledPromiseOutput } from '@/data/promise/promise';
import { useControlledTruthyTimer, ControlledTruthyTimerOutput } from '@/lifecycle/timer/timer';

export enum StalePromiseTimerComponent {
	none,
	timer,
	promise
}

export interface StalePromiseTimerInput<T> {
	initialAction: StalePromiseTimerComponent;

	timerTimeout: number,
	isTimerTruthy: boolean;
	timerCallback: () => void;

	promiseFunc: () => Promise<T>;
	promiseCallback: (data: T | null, error: Error | null) => void;
}

export interface StalePromiseTimerOutput<T> {
	timer: ControlledTruthyTimerOutput;
	promise: DataControlledPromiseOutput<T>;
	lastCompleted: StalePromiseTimerComponent;
}

export function useStalePromiseTimer<T>(input: StalePromiseTimerInput<T>): StalePromiseTimerOutput<T> {

	const { initialAction, timerTimeout, isTimerTruthy, timerCallback, promiseFunc, promiseCallback } = input;

	const isTimerStartedInitially = initialAction === StalePromiseTimerComponent.timer;
	const isPromiseRunningInitially = initialAction === StalePromiseTimerComponent.promise;
	const [lastCompletedComponent, setLastCompletedComponent] = React.useState<StalePromiseTimerComponent>(StalePromiseTimerComponent.none);

	const timerOutput = useControlledTruthyTimer(isTimerStartedInitially, timerTimeout, isTimerTruthy, () => {

		setLastCompletedComponent(() => {
			return StalePromiseTimerComponent.timer;
		});
		timerCallback();

		return false;
	});
	const promiseOutput = useDataControlledPromise(isPromiseRunningInitially, promiseFunc, (data, error) => {

		setLastCompletedComponent(() => {
			return StalePromiseTimerComponent.promise;
		});
		promiseCallback(data, error);

		return {
			run: false
		};
	});

	return React.useMemo<StalePromiseTimerOutput<T>>(() => {
		return {
			timer: timerOutput,
			promise: promiseOutput,
			lastCompleted: lastCompletedComponent
		};
	}, [timerOutput, promiseOutput, lastCompletedComponent]);
}