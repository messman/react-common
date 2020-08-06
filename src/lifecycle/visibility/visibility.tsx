import * as React from 'react';


const DocumentVisibilityContext = React.createContext<boolean>(null!);
export const useDocumentVisibility = () => React.useContext(DocumentVisibilityContext);

export interface DocumentVisibilityProviderProps {
	/** If true, provider is forced into the hidden state. */
	testForceHidden?: boolean;
}

export const DocumentVisibilityProvider: React.FC<DocumentVisibilityProviderProps> = (props) => {

	const [documentHidden, setDocumentHidden] = React.useState(document.hidden);

	const [visibility, setVisibility] = React.useState(props.testForceHidden || documentHidden);

	React.useEffect(() => {
		function onVisibilityChange() {
			setDocumentHidden(document.hidden);
		}
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, []);

	React.useEffect(() => {
		setVisibility(props.testForceHidden || documentHidden);
	}, [documentHidden, props.testForceHidden]);

	return (
		<DocumentVisibilityContext.Provider value={visibility}>
			{props.children}
		</DocumentVisibilityContext.Provider>
	);
};

