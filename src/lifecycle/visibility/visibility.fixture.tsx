import * as React from 'react';
import { TestWrapper } from '@/test/decorate';
import { useDocumentVisibility } from './visibility';

export default () => {
	return (
		<TestWrapper>
			<TestVisibility />
		</TestWrapper>
	);
};

const TestVisibility: React.FC = () => {

	const documentVisibility = useDocumentVisibility();

	const [history, setHistory] = React.useState<boolean[]>([]);

	React.useEffect(() => {
		setHistory((p) => {
			return [...p, documentVisibility];
		});
	}, [documentVisibility]);

	const historyItems = history.map((item, i) => {
		const text = item ? 'Visible' : 'Hidden';

		return (
			<p key={i}>{text}</p>
		);
	});

	return (
		<>{historyItems}</>
	);
};