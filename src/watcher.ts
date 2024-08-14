import * as chokidar from 'chokidar';
import * as vscode from 'vscode';
import * as path from 'path';
import { exportEnv, updateEnv } from './conda';

const DEBOUNCE_DELAY = 1000;
const POLLING_INTERVAL = 300; //in ms

const options = {
    persistent: true,
    ignoreInitial: true,
    depth: 1,
    ignorePermissionErrors: true,
    usePolling: false,
    interval: POLLING_INTERVAL,
    ignored: '^(?!.*(history|__pycache__)).*$',
};
const watcher = chokidar.watch([], options);
export async function watchEnv(env_path: string) {
    // Upon watching a new conda environment, check for initial updates
    const new_env_content = await exportEnv(env_path);
    await updateEnv(new_env_content);

    const watched = await watcher.getWatched();
    await watcher.close(); //Close all watchers

    const history_path = path.join(env_path, 'conda-meta', 'history');
    const pip_path = path.join(env_path, 'Lib', 'site-packages');
    watcher.add([history_path, pip_path]);

    let debounceTimeout : NodeJS.Timeout;
    const debounceUpdate = (delay = DEBOUNCE_DELAY) => { // avoids overuse of updateEnv, which calls python.exe and cmd.exe (see utils.ts)
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            try {
                const output = await exportEnv(env_path);
                await updateEnv(output);
            } catch (error) {
                vscode.window.showErrorMessage(`CondaSync: Failed to export Conda environment: ${error}`);
            }
        }, delay);
    };

    watcher
        .on('change', async (file_path) => {
            if (file_path === history_path) {
                //vscode.window.showInformationMessage(`Changed: ${file_path}`);
                debounceUpdate();
            }
        })
        .on('addDir', async (file_path) => {
            //vscode.window.showInformationMessage(`Added Dir: ${file_path}`);
            debounceUpdate();
        })
        .on('unlinkDir', async (file_path) => {
            //vscode.window.showInformationMessage(`Unliked Dir: ${file_path}`);
            debounceUpdate();
        })
        .on('unlink', async (file_path) => {
            if (file_path === history_path) {
                try {
                    //vscode.window.showInformationMessage(`Unliked file: ${file_path}`);
                    vscode.window.showInformationMessage('CondaSync: Environment removed. Please set new conda environment.');
                } catch (error) {
                    vscode.window.showErrorMessage(`CondaSync: Failed to close watcher: ${error}`);
                }
            }
        });
}
export function getWatcher() {
    return watcher;
}