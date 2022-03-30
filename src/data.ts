import { info } from 'console';
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

	await info.update('url', url);
	await info.update('email', email);
	await info.update('password', password);

	await saveToken(info);
}

export async function saveToken(info: vscode.Memento) {
	const axios = require('axios');
	let url = await info.get('url');
	const email = await info.get('email');
	const password = await info.get('password');
	url += 'api/v1/tokens/';
	console.log(url);

	await axios.get(url, {auth: {username:email, password:password}})
	.then((res:any) => {
		info.update('token', res.data['token']);
	})
	.catch((err:any) => {
		vscode.window.showErrorMessage(`Can not save Token`);
	});
}