import * as chokidar from 'chokidar';
import * as vscode from 'vscode';
import * as path from 'path';
import { exportEnv, updateEnv } from './conda';

const POLLING_INTERVAL = 300; //in ms
const options = {
    persistent: true,
    ignoreInitial: true,
    depth: 1,
    ignorePermissionErrors: true,
    usePolling: true,
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

    watcher
        .on('addDir', async (file_path) => {
            try {
                const output = await exportEnv(env_path);
                await updateEnv(output);
            } catch (error) {
                vscode.window.showErrorMessage(`CondaSync: Failed to export Conda environment: ${error}`);
            }
        })
        .on('unlinkDir', async (file_path) => {
            try {
                vscode.window.showInformationMessage(`Yert: ${file_path}`);
                const output = await exportEnv(env_path);
                await updateEnv(output);
            } catch (error) {
                vscode.window.showErrorMessage(`CondaSync: Failed to export Conda environment: ${error}`);
            }
        });
}
export function getWatcher() {
    return watcher;
}