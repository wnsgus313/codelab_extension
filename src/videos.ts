import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import got from 'got';
import FormData = require('form-data');

export async function uploadVideo(url:string, title:string, targetPath:string, info:vscode.Memento) {
    const formData = new FormData();
    const token = await info.get('token');

	console.log(targetPath); // /Users/junhyeonbae/Desktop/vscode연습/백준문제풀이/Bracket
	console.log(url); // http://203.245.41.143:5000/api/v1/video/Bracket
    
    path.join(targetPath, 'test.mp4');
    formData.append('file', fs.createReadStream(path.join(targetPath, 'test.mp4')), 'video.mp4');
    const auth = 'Basic ' + Buffer.from(token + ':').toString('base64');

    got.post(url, {
        body: formData,
        headers: {
            "Authorization": auth
        }
    }).then((res:any) => {
        vscode.window.showInformationMessage(res.data['message']);
    }).catch((err:any) => {
        vscode.window.showErrorMessage(`Video upload failed`);
    });
}