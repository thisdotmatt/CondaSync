import * as vscode from 'vscode';
import { exportEnv, updateEnv } from './conda';

interface Settings {
    environment_path: string | undefined;
    yml_path: string | undefined;
    yml_name: string | undefined;
    verbose: string | undefined;
}

function getConfigValue(config: vscode.WorkspaceConfiguration, key: string): string | undefined {
    const inspect = config.inspect<string>(key);

    if (inspect) {
        if (inspect.workspaceValue && inspect.workspaceValue != "") {
            return inspect.workspaceValue;
        } else if (inspect.globalValue && inspect.globalValue != "") {
            return inspect.globalValue;
        } else {
            return undefined; //default to workspace value when possible
        }
    }
    return undefined;
}

export function getSettings(): Settings {
    const config = vscode.workspace.getConfiguration('condasync', vscode.Uri.file('.'));
    let settings = {
        environment_path: getConfigValue(config, 'Environment Path'),
        yml_path: getConfigValue(config, 'YML File Path'),
        yml_name: getConfigValue(config, 'YML File Name'),
        verbose: getConfigValue(config, 'Verbose'),
    }
    return settings;
}

export let configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration('condasync.Environment Path', vscode.Uri.file('.')) ||
        event.affectsConfiguration('condasync.YML File Path', vscode.Uri.file('.')) ||
        event.affectsConfiguration('condasync.YML File Name', vscode.Uri.file('.')) ||
        event.affectsConfiguration('condasync.Verbose'), vscode.Uri.file('.')) {

        let settings = getSettings();
        if (settings.environment_path && settings.yml_path && settings.yml_name) { // update after settings change
            const new_env_content = await exportEnv(settings.environment_path);
            await updateEnv(new_env_content);
        }
    }
});