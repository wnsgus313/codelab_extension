import * as vscode from 'vscode';

export function askUserUrl() {
	return vscode.window.showInputBox({
		prompt: 'input url',
	});
}

export function askUserForEmail() {
	return vscode.window.showInputBox({
		prompt: 'input your email'
	});
}

export function askUserForPassword() {
	return vscode.window.showInputBox({
		prompt: 'input your password'
	});
}
export async function askUserForSave(info: any) {
	let url = await askUserUrl();
	let email = await askUserForEmail();
	let password = await askUserForPassword();

	info.update('url', url);
	info.update('email', email);
	info.update('password', password);
}