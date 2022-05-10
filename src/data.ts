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
		info.update('username', res.data['username']);
	})
	.catch((err:any) => {
		vscode.window.showErrorMessage(`Can not save Token`);
	});
}

export async function logout(info: any) {

	await info.update('url', );
	await info.update('email', );
	await info.update('password', );
	await info.update('token', );
	await info.update('username', );
}

export async function changestatusTrue(info: any) {

	if (info.get('token') !== undefined)
	{
		await vscode.commands.executeCommand('setContext', 'extensionSelectionMode', true);
	}

}

export function changestatusFalse(info: any) {

	vscode.commands.executeCommand('setContext', 'extensionSelectionMode', false);

}