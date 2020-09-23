import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useRefEffectCallback, useRefLayoutEffect } from '@/utility/ref-effect/ref-effect';

export default { title: 'Test/Playground' };

export const TestPhases = decorate('React Phases', () => {

	console.log('render - before');
	const [count, setCount] = React.useState(0);
	const [isExpired, dispatch] = React.useReducer(function (state: boolean, action: string) {
		console.log('reducer', state);
		if (action === 'expire') {
			return true;
		}
		// Else, reset.
		return false;
	}, false);
	console.log('render - after');

	const ref = React.useRef(-1);

	React.useEffect(() => {
		console.log('effect');
		dispatch('reset');
		ref.current = window.setTimeout(() => {
			console.log('timeout');
			dispatch('expire');
		}, 15000);
		return () => {
			console.log('effect - cleanup');
			clearTimeout(ref.current);
			ref.current = -1;
		};
	}, [count]);

	function onClick() {
		console.log('onclick');
		setCount(p => p + 1);
	}

	return (
		<>
			<p>Count: {count}</p>
			<p>Is Expired: {isExpired.toString()}</p>
			<button onClick={onClick}>Increment</button>
		</>
	);
});

export const TestRefOrder1 = decorate('Ref Order 1', () => {

	const [refOrders, setRefOrders] = React.useState<string[]>([]);

	const outerRef = useRefLayoutEffect(() => {
		const canAccessInnerRef = !!innerRef.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Outer Ref set (${canAccessInnerRef} access Inner Ref)`];
		});
	});

	const innerRef = useRefLayoutEffect(() => {
		const canAccessOuterRef = !!outerRef.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Inner Ref set (${canAccessOuterRef} access Outer Ref)`];
		});
	});

	const outputText = refOrders.join(' | ');

	return (
		<>
			<p>Inner ref is in the same component.</p>
			<div ref={outerRef}>
				<div ref={innerRef}>
				</div>
			</div>
			<p>{outputText}</p>
		</>
	);
});

export const TestRefOrder2 = decorate('Ref Order 2', () => {

	const [refOrders, setRefOrders] = React.useState<string[]>([]);
	const innerRefProxy = React.useRef<any>(null!);

	const outerRef = useRefLayoutEffect(() => {
		const canAccessOuterToInnerRef = !!outerToInnerRef.current ? 'can' : 'cannot';
		const canAccessInnerRef = !!innerRefProxy.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Outer Ref set (${canAccessOuterToInnerRef} access Outer To Inner Ref, ${canAccessInnerRef} access Inner Ref)`];
		});
	});

	const outerToInnerRef = useRefLayoutEffect(() => {
		const canAccessOuterRef = !!outerRef.current ? 'can' : 'cannot';
		const canAccessInnerRef = !!innerRefProxy.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Outer To Inner Ref set (${canAccessOuterRef} access Outer Ref, ${canAccessInnerRef} access Inner Ref)`];
		});
	});


	function onInnerRefSet(element: HTMLElement) {
		innerRefProxy.current = element;
		const canAccessOuterRef = !!outerRef.current ? 'can' : 'cannot';
		const canAccessOuterToInnerRef = !!outerToInnerRef.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Inner Ref set (${canAccessOuterRef} access Outer Ref, ${canAccessOuterToInnerRef} access Outer To Inner Ref)`];
		});
	}

	const outputText = refOrders.join(' | ');

	return (
		<div>
			<p>Inner ref is in a child component.</p>
			<div ref={outerRef}>
				<RefOrder2Inner outerToInnerRef={outerToInnerRef} onInnerRefSet={onInnerRefSet} />
			</div>
			<p>{outputText}</p>
		</div>
	);
});

interface RefOrder2InnerProps {
	outerToInnerRef: React.RefObject<any>;
	onInnerRefSet: (element: HTMLElement) => void;
}

const RefOrder2Inner: React.FC<RefOrder2InnerProps> = (props) => {
	const { outerToInnerRef, onInnerRefSet } = props;

	const innerRef = useRefLayoutEffect(onInnerRefSet);

	return (
		<div>
			<div ref={outerToInnerRef}>
			</div>
			<div ref={innerRef}>
			</div>
		</div>
	);
};

export const TestRefOrder3 = decorate('Ref Order 3', () => {

	const [refOrders, setRefOrders] = React.useState<string[]>([]);
	const outerRefProxy = React.useRef<any>(null!);
	const outerToInnerRefProxy = React.useRef<any>(null!);
	const innerRefProxy = React.useRef<any>(null!);

	const outerRefFunc = useRefEffectCallback((element) => {
		outerRefProxy.current = element;
		const canAccessOuterToInnerRef = !!outerToInnerRefProxy.current ? 'can' : 'cannot';
		const canAccessInnerRef = !!innerRefProxy.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Outer Ref set (${canAccessOuterToInnerRef} access Outer To Inner Ref, ${canAccessInnerRef} access Inner Ref)`];
		});
	});

	const outerToInnerRefFunc = useRefEffectCallback((element) => {
		outerToInnerRefProxy.current = element;
		const canAccessOuterRef = !!outerRefProxy.current ? 'can' : 'cannot';
		const canAccessInnerRef = !!innerRefProxy.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Outer To Inner Ref set (${canAccessOuterRef} access Outer Ref, ${canAccessInnerRef} access Inner Ref)`];
		});
	});


	function onInnerRefSet(element: HTMLElement) {
		innerRefProxy.current = element;
		const canAccessOuterRef = !!outerRefProxy.current ? 'can' : 'cannot';
		const canAccessOuterToInnerRef = !!outerToInnerRefProxy.current ? 'can' : 'cannot';

		setRefOrders((p) => {
			return [...p, `Inner Ref set (${canAccessOuterRef} access Outer Ref, ${canAccessOuterToInnerRef} access Outer To Inner Ref)`];
		});
	}

	const outputText = refOrders.join(' | ');

	return (
		<div>
			<p>Inner ref is in a child component.</p>
			<p>Outer refs use simple (quick) callbacks.</p>
			<div ref={outerRefFunc}>
				<RefOrder3Inner outerToInnerRefFunc={outerToInnerRefFunc} onInnerRefSet={onInnerRefSet} />
			</div>
			<p>{outputText}</p>
		</div>
	);
});

interface RefOrder3InnerProps {
	outerToInnerRefFunc: (element: HTMLDivElement) => void;
	onInnerRefSet: (element: HTMLElement) => void;
}

const RefOrder3Inner: React.FC<RefOrder3InnerProps> = (props) => {
	const { outerToInnerRefFunc, onInnerRefSet } = props;

	const innerRef = useRefLayoutEffect(onInnerRefSet);

	return (
		<div>
			<div ref={outerToInnerRefFunc}>
			</div>
			<div ref={innerRef}>
			</div>
		</div>
	);
};


