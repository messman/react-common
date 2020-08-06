import * as React from 'react';
import { decorate } from '@/test/decorate';
import { useDocumentVisibility } from './visibility';

export default { title: 'Lifecycle/Visibility' };

export const TestVisibility = decorate('Visibility', () => {

	const documentVisibility = useDocumentVisibility();

	const [history, setHistory] = React.useState<boolean[]>([]);

	React.useEffect(() => {
		setHistory((p) => {
			return [...p, documentVisibility];
		});
	}, [documentVisibility]);

	const historyItems = history.map((item, i) => {
		const text = item ? 'Hidden' : 'Visible';

		return (
			<p key={i}>{text}</p>
		);
	});

	return (
		<>{historyItems}</>
	);
});