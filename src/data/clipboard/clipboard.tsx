
/*
	Clipboard is hard. https://stackoverflow.com/q/34045777
	
	MDN: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
	There is upcoming new functionality for this in the form of the async 'writeText' and permissions API.
	In 2020, support was scant; in 2022, it's much better.
	In 2022 we changed this code to use writeText first instead of the document.execCommand fallback.

	This code only writes to the clipboard. It does not try to read from the clipboard at all.

	Test this in Firefox, iOS Safari, Desktop Safari, and Chrome.
*/

/**
 * Sets the clipboard. Does not read from the clipboard.
 * 
 * Uses `clipboard.writeText` (https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText),
 * and falls back on `document.execCommand('copy')`.
 * 
 * Should work in all major browsers.
 * See https://caniuse.com/?search=writetext
 */
export async function setClipboard(text: string | string[]): Promise<boolean> {
	const textLines = Array.isArray(text) ? text : [text];

	if (!!window.navigator && !!window.navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(textLines.join('\n'));
			return true;
		}
		catch {
			console.warn('Failure to copy to clipboard via clipboard.writeText');
		}
	}
	if (!tryExecCopy(textLines)) {
		console.error('Failure to copy to clipboard via exec copy command.');
		return false;
	}
	return true;
}

function tryExecCopy(textLines: string[]): boolean {
	const textarea = document.createElement('textarea');

	textarea.setAttribute('size', '0');
	textarea.style.setProperty('border', 'none');
	textarea.style.setProperty('margin', '0');
	textarea.style.setProperty('padding', '0');
	textarea.style.setProperty('outline', 'none');

	textarea.style.setProperty('box-sizing', 'border-box');
	textarea.style.setProperty('position', 'absolute');

	textarea.style.setProperty('width', '1px');
	textarea.style.setProperty('height', '1px');
	textarea.style.setProperty('min-width', '1px');
	textarea.style.setProperty('min-height', '1px');
	textarea.style.setProperty('max-width', '1px');
	textarea.style.setProperty('max-height', '1px');

	textarea.style.setProperty('margin-bottom', '-1px');
	textarea.style.setProperty('margin-right', '-1px');

	document.body.appendChild(textarea);

	textarea.value = textLines.join('\n');
	textarea.select();
	let isSuccess = false;
	if (document.execCommand) {
		isSuccess = document.execCommand('copy');
	}
	textarea.parentNode!.removeChild(textarea);

	return isSuccess;
}