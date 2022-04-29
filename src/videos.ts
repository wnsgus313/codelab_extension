import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import got from 'got';
import FormData = require('form-data');

export async function uploadVideo(url:string, title:string, targetPath:string, info:vscode.Memento) {
    const formData = new FormData();
    const token = await info.get('token');
    
    let fileLists:string[] = fs.readdirSync(targetPath);

    fileLists.forEach((file) => {
        let reg = /(.*?)\.(mp4|avi)$/;
        if (file.match(reg)){
            formData.append('file', fs.createReadStream(path.join(targetPath, file)), file);
        }
	});


    // formData.append('file', fs.createReadStream(path.join(targetPath, 'test.mp4')), 'video.mp4');
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