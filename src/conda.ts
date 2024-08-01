import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { executeCommand } from './utils';
import { watchEnv } from './watcher';
import {getEnvironmentPath, getYmlPath, getYmlName, isVerbose} from './config';

async function findYml(yml_name: string, base_folder?: string): Promise<string | undefined> {
    const workspace_folders = vscode.workspace.workspaceFolders;

    if (!workspace_folders) {
        vscode.window.showErrorMessage('CondaSync: Workspace folder was not found');
        return undefined;
    }

     // Check if the base folder exists in any of the workspace folders
    let invalid_paths = 0
    for (const folder of workspace_folders) {
        let folder_path = base_folder ? path.join(folder.uri.fsPath, base_folder) : folder.uri.fsPath;
        if (base_folder && !fs.existsSync(folder_path)) {
            vscode.window.showErrorMessage(`CondaSync: Directory ${folder_path} does not exist`);
        }
    }
    if (invalid_paths == workspace_folders.length) {
        return undefined;
    }

    let search_paths: string[] = [];
    if (base_folder) {
        search_paths = workspace_folders.map(folder => path.join(folder.uri.fsPath, base_folder, yml_name));
    } else {
        search_paths = workspace_folders.map(folder => path.join(folder.uri.fsPath, yml_name));
    }

    for (const env_path of search_paths) {
        if (fs.existsSync(env_path)) {
            return env_path;
        }
    }

    //if file not found, create it
    const top_folder = base_folder ? path.join(workspace_folders[0].uri.fsPath, base_folder) : workspace_folders[0].uri.fsPath;
    const env_path = path.join(top_folder, yml_name);
    await fs.promises.writeFile(env_path, "", 'utf8');
    vscode.window.showInformationMessage(`CondaSync: Created ${env_path}`);
    return env_path;
}

export async function updateEnv(updated_content: string) {
    const config = vscode.workspace.getConfiguration('condasync');
    let base_folder = config.get<string>('YML File Path');
    let yml_name = config.get<string>('YML File Name');
    vscode.window.showErrorMessage(`Initiated Conda Update: ${base_folder}, ${yml_name}`);

    if (!yml_name || !base_folder) return; //ensure the inputs are defined
    let yml_path = await findYml(yml_name, base_folder);
    if (!yml_path) return;

    try {
        const current_content = await fs.promises.readFile(yml_path, 'utf8');
        if (current_content.trim() !== updated_content.trim()) {
            vscode.window.showInformationMessage(`CondaSync: Updating ${yml_name}`);
            await fs.promises.writeFile(yml_path, updated_content, 'utf8');
        } else {
            vscode.window.showInformationMessage(`CondaSync: ${yml_name} is already up to date`);
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`CondaSync: Error updating ${yml_name}: ${error.message}`);
    }
}

export async function exportEnv(env_path: string): Promise<string> {
    try {
        const { stdout, stderr } = await executeCommand(`conda env export --prefix ${env_path}`);
        if (stderr) {
            vscode.window.showErrorMessage(`CondaSync: Error exporting conda environment: ${stderr}`);
            throw new Error(stderr);
        }
        return stdout;
    } catch (error: any) {
        vscode.window.showErrorMessage(`CondaSync: Error exporting conda environment: ${error.message}`);
        throw error;
    }
}

export async function getEnvPath(env_path: string): Promise<string | null> {
    try {
        const { stdout, stderr } = await executeCommand('conda env list');
        if (stderr) {
            vscode.window.showErrorMessage(`CondaSync: Error executing conda env list: ${stderr}`);
            return null;
        }

        // Code block to parse conda env list for the specific environment path
        const env_list = stdout.split('\n');
        for (const line of env_list) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [name, ..._] = trimmed.split(/\s+/);
                if (name === env_path) {
                    const env_path = _.join(' ');
                    if (env_path) {
                        return env_path.trim();
                    }
                }
            }
        }
        return null;
    } catch (error: any) {
        vscode.window.showErrorMessage(`CondaSync: Error executing conda env list: ${error.message}`);
        return null;
    }
}

export async function setCondaEnv() {
    const env_name = await vscode.window.showInputBox({
        prompt: 'Enter the Conda environment name',
        placeHolder: 'Example: my_env'
    });

    if (!env_name) {
        vscode.window.showErrorMessage('CondaSync: No environment name provided');
        return;
    }
    const env_path = await getEnvPath(env_name);
    if (env_path) {
        await vscode.workspace.getConfiguration('condasync').update('Environment Path', env_path);
        vscode.window.showInformationMessage(`CondaSync: Environment set to "${env_name}"`);
        watchEnv(env_path);
    } else {
        vscode.window.showErrorMessage(`CondaSync: Failed to find environment "${env_name}"`);
    }
}
