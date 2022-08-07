import * as React from 'react';

const DocumentVisibilityContext = React.createContext<boolean>(null!);
export const useDocumentVisibility = () => React.useContext(DocumentVisibilityContext);

export interface DocumentVisibilityProviderProps {
	/** If true, provider is forced into the hidden state. */
	testForceHidden?: boolean;
	children?: React.ReactNode;
}

/** Provides access to the document hidden state or a test value that mocks the hidden state. */
export const DocumentVisibilityProvider: React.FC<DocumentVisibilityProviderProps> = (props) => {

	const [documentHidden, setDocumentHidden] = React.useState(document.hidden);

	const [isVisible, setIsVisible] = React.useState(!props.testForceHidden && !documentHidden);

	React.useEffect(() => {
		function onVisibilityChange() {
			setDocumentHidden(document.hidden);
		}
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, []);

	// This runs on first render, but it doesn't matter. Same result.
	React.useEffect(() => {
		setIsVisible(!props.testForceHidden && !documentHidden);
	}, [documentHidden, props.testForceHidden]);

	return (
		<DocumentVisibilityContext.Provider value={isVisible}>
			{props.children}
		</DocumentVisibilityContext.Provider>
	);
};

