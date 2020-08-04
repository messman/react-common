import * as React from 'react';



// // Usage
// function App() {
// 	// State value and setter for our example
// 	const [count, setCount] = useState(0);

// 	// Get the previous value (was passed into hook on last render)
// 	const prevCount = usePrevious(count);

// 	// Display both current and previous count value
// 	return (
// 		<div>
// 			<h1>Now: {count}, before: {prevCount}</h1>
// 			<button onClick={() => setCount(count + 1)}>Increment</button>
// 		</div>
// 	);
// }

// from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T): T | undefined {
	const ref = React.useRef<T | undefined>(undefined);

	React.useEffect(() => {
		// This effect does run immediately the first time, but we are setting a ref so it doesn't cause any re-rendering.
		ref.current = value;
	}, [value]);

	return ref.current;
}