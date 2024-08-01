import * as vscode from 'vscode';
import { exportEnv, updateEnv } from './conda';

const config = vscode.workspace.getConfiguration('condasync');
let environment_path: string | undefined = config.get<string>('Environment Path');;
let yml_path: string | undefined = config.get<string>('YML File Path');;
let yml_name: string | undefined = config.get<string>('YML File Name');;
let verbose: boolean | undefined = config.get<boolean>('Verbose');;

export function getEnvironmentPath(): string | undefined {return environment_path;}
export function getYmlPath(): string | undefined {return yml_path;}
export function getYmlName(): string | undefined {return yml_name;}
export function isVerbose(): boolean | undefined {return verbose;}
export let configListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration('condasync.Environment Path') || event.affectsConfiguration('condasync.YML File Path') || 
        event.affectsConfiguration('condasync.YML File Name') || event.affectsConfiguration('condasync.Verbose')) {
        
        const config = vscode.workspace.getConfiguration('condasync');
        environment_path = config.get<string>('Environment Path');
        yml_path = config.get<string>('YML File Path');
        yml_name = config.get<string>('YML File Name');
        verbose = config.get<boolean>('Verbose');
        
        if (environment_path && yml_path && yml_name) { // update after settings change
            const new_env_content = await exportEnv(environment_path);
            await updateEnv(new_env_content);
        }
    }
});