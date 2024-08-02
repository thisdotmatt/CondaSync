import * as vscode from 'vscode';
import { executeCommand } from './utils';

export async function checkGit(directory: string): Promise<boolean> {
    try {
        const { stdout, stderr } = await executeCommand(`cd ${directory} && git rev-parse --is-inside-work-tree`);
        if (stderr) {
            vscode.window.showErrorMessage(`CondaSync: Error finding local git repository: ${stderr}`);
            throw new Error(stderr);
        } else if (stdout.trim() === "true") {
            return true
        } else {
            return false
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`CondaSync: Experienced an error: ${error.message}`);
        throw error;
    }
}

export async function commitChanges(env_path: string, commit_message: string, verbose: boolean): Promise<void> {
    const workspace_folders = vscode.workspace.workspaceFolders;
    if (!workspace_folders) {
        vscode.window.showErrorMessage('CondaSync: Workspace folder was not found');
        return undefined;
    }
    let directory = workspace_folders[0].uri.fsPath; // TODO: create utility for getting workspace folder(s)
    try {
        let git_status = await checkGit(directory)
        if (git_status) {
            let { stdout, stderr } = await executeCommand(`cd ${directory} && git add ${env_path}`);
            if (stderr) {
                vscode.window.showErrorMessage(`CondaSync: Error adding ${env_path} to staging area: ${stderr}`);
                throw new Error(stderr);
            }
            let { stdout: sout, stderr: commiterr } = await executeCommand(`cd ${directory} && git commit -m "${commit_message}"`);
            if (commiterr) {
                vscode.window.showErrorMessage(`CondaSync: Error committing changes: ${commiterr}`);
                throw new Error(commiterr);
            }
            if (verbose) {
                vscode.window.showInformationMessage(`CondaSync: Successfully committed ${env_path} ${stdout}`);
            }
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`CondaSync: Experienced an error: ${error.message}`);
        throw error;
    }
}