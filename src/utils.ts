import { exec } from 'child_process';

export async function executeCommand(command: string): Promise<{ stdout: string, stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}