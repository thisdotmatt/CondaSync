import * as vscode from 'vscode';
import { exportEnv, updateEnv } from './conda';

interface Settings {
    environment_path: string | undefined;
    yml_path: string | undefined;
    yml_name: string | undefined;
    verbose: boolean | undefined;
    git: boolean | undefined;
    commit_message: string | undefined;
}

function getStringConfigValue(config: vscode.WorkspaceConfiguration, key: string): string | undefined {
    return getConfigValue<string>(config, key);
}

function getBoolConfigValue(config: vscode.WorkspaceConfiguration, key: string): boolean | undefined {
    return getConfigValue<boolean>(config, key);
}

function getConfigValue<T>(config: vscode.WorkspaceConfiguration, key: string): T | undefined {
    const inspect = config.inspect<T>(key);
    if (inspect) {
        if (inspect.workspaceValue !== undefined) {
            return inspect.workspaceValue;
        } else if (inspect.globalValue !== undefined) {
            return inspect.globalValue;
        } else if (inspect.defaultValue !== undefined) {
            return inspect.defaultValue;
        }
    }
    return undefined;
}

export function getSettings(): Settings {
    const config = vscode.workspace.getConfiguration('condasync');
    let settings = {
        environment_path: getStringConfigValue(config, 'Environment Path'),
        yml_path: getStringConfigValue(config, 'YML File Path'),
        yml_name: getStringConfigValue(config, 'YML File Name'),
        verbose: getBoolConfigValue(config, 'Verbose'),
        git: getBoolConfigValue(config, 'Git'),
        commit_message: getStringConfigValue(config, 'Message')
    }
    return settings;
}

export let configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration('condasync', vscode.Uri.file('.'))) {
        vscode.window.showInformationMessage('Config changed');
        let settings = getSettings();

        if (settings.environment_path && settings.yml_path && settings.yml_name) { // update after settings change
            const new_env_content = await exportEnv(settings.environment_path);
            await updateEnv(new_env_content);
        }
    }
});