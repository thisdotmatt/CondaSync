/* 
Matthew Grimalovsky
8/1/2024
*/

import * as vscode from 'vscode';
import { setCondaEnv, exportEnv, updateEnv } from './conda';
import { getWatcher, watchEnv } from './watcher';
import { configListener, getSettings } from './config';

export async function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('setCondaEnv', setCondaEnv);
    let config_listener = configListener; // Register the listener for configuration changes
    let settings = getSettings()

    context.subscriptions.push(disposable);
    context.subscriptions.push(config_listener);

    if (settings.environment_path) {
        await watchEnv(settings.environment_path);
        const new_env_content = await exportEnv(settings.environment_path);
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
