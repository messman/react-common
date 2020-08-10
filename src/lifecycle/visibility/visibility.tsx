import * as React from 'react';
import { useChangeEffect } from '@/utility/render/render';


const DocumentVisibilityContext = React.createContext<boolean>(null!);
export const useDocumentVisibility = () => React.useContext(DocumentVisibilityContext);

export interface DocumentVisibilityProviderProps {
	/** If true, provider is forced into the hidden state. */
	testForceHidden?: boolean;
}

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

	useChangeEffect(() => {
		setIsVisible(!props.testForceHidden && !documentHidden);
	}, [documentHidden, props.testForceHidden]);

	return (
		<DocumentVisibilityContext.Provider value={isVisible}>
			{props.children}
		</DocumentVisibilityContext.Provider>
	);
};

