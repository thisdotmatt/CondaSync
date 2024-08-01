/* 
Matthew Grimalovsky
7/31/2024
*/

import * as vscode from 'vscode';
import { setCondaEnv, exportEnv, updateEnv} from './conda';
import {getWatcher, watchEnv} from './watcher';
import { configListener, getEnvironmentPath, getYmlPath, getYmlName, isVerbose} from './config';

export async function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('setCondaEnv', setCondaEnv);
    let config_listener = configListener; // Register the listener for configuration changes
    let environment_path = getEnvironmentPath()

    context.subscriptions.push(disposable);
    context.subscriptions.push(config_listener);

    if (environment_path) { 
        await watchEnv(environment_path);
        const new_env_content = await exportEnv(environment_path);
        await updateEnv(new_env_content);
        vscode.window.showInformationMessage('CondaSync: started successfully');
    } else {
        vscode.window.showInformationMessage('CondaSync: no environment set');
    }
}

export function deactivate() {
    vscode.window.showInformationMessage('CondaSync: deactivated');
    let watcher = getWatcher()
    watcher.close();
}
