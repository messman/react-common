import * as React from 'react';
import { FlexRoot } from '../flex/flex';
import styled from 'styled-components';

export interface OverlayProps {
	isActive: boolean;
	component: JSX.Element | null;
	backdropOpacity?: number;
	backdropColor: string;
	onBackdropClick?: (() => void) | null;
}

export const Overlay: React.FC<OverlayProps> = (props) => {
	const { isActive, component, backdropOpacity, backdropColor, onBackdropClick } = props;

	const backdropProps: OverlayAbsoluteBackdropProps = {
		isActive: isActive,
		backgroundColor: backdropColor,
		backdropOpacity: backdropOpacity || 1
	};

	const onClick = onBackdropClick || undefined;

	return (
		<>
			{props.children}
			<OverlayAbsoluteBackdrop onClick={onClick} {...backdropProps} />
			<OverlayAbsoluteComponentContainer isActive={isActive}>
				{component}
			</OverlayAbsoluteComponentContainer>
		</>
	);
};

interface OverlayAbsoluteBackdropProps {
	isActive: boolean;
	backgroundColor: string;
	backdropOpacity: number;
}

const OverlayAbsoluteBackdrop = styled.div<OverlayAbsoluteBackdropProps>`
	display: ${p => p.isActive ? 'block' : 'none'};
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: ${p => p.backgroundColor};
	opacity: ${p => p.backdropOpacity};
`;

interface OverlayAbsoluteComponentContainerProps {
	isActive: boolean;
}

const OverlayAbsoluteComponentContainer = styled(FlexRoot) <OverlayAbsoluteComponentContainerProps>`
	display: ${p => p.isActive ? 'flex' : 'none'};
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;