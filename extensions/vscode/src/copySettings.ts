import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from "vscode";

export const FIRST_LAUNCH_KEY = 'pearai.firstLaunch';
const pearAISettingsDir = path.join(os.homedir(), '.pearai');
const pearAIDevExtensionsDir = path.join(os.homedir(), '.pearai', 'extensions');

const firstLaunchFlag = path.join(pearAISettingsDir, 'firstLaunch.flag');
const firstPearAICreatorLaunchFlag = path.join(pearAISettingsDir, 'firstLaunchCreator.flag');
export const isFirstPearAICreatorLaunch = !fs.existsSync(firstPearAICreatorLaunchFlag);

// Removed file based flag migration, we show new onboarding to old users
export function isFirstLaunch(context: vscode.ExtensionContext): boolean {
    const stateExists = context.globalState.get<boolean>(FIRST_LAUNCH_KEY);
    console.log("isFirstLaunch");
    console.log(!stateExists);
    // If state is set and is true, it's not first launch
    return !stateExists;
}


function getPearAISettingsDir() {
    const platform = process.platform;
    if (platform === 'win32') {
        return path.join(process.env.APPDATA || '', 'pearai', 'User');
    } else if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'pearai', 'User');
    } else {
        return path.join(os.homedir(), '.config', 'pearai', 'User');
    }
}

function getVSCodeExtensionsDir() {
    return path.join(os.homedir(), '.vscode', 'extensions');
}


async function copyVSCodeSettingsToPearAIDir() {
    const vscodeSettingsDir = getVSCodeSettingsDir();
    const pearAIDevSettingsDir = getPearAISettingsDir();
    const vscodeExtensionsDir = getVSCodeExtensionsDir();

    await fs.promises.mkdir(pearAIDevSettingsDir, { recursive: true });
    await fs.promises.mkdir(pearAIDevExtensionsDir, { recursive: true });

    const itemsToCopy = ['settings.json', 'keybindings.json', 'snippets', 'sync', 'globalStorage/state.vscdb', 'globalStorage/state.vscdb.backup'];

    for (const item of itemsToCopy) {
        const source = path.join(vscodeSettingsDir, item);
        const destination = path.join(pearAIDevSettingsDir, item);

        try {
            if (await fs.promises.access(source).then(() => true).catch(() => false)) {
                const stats = await fs.promises.lstat(source);
                if (stats.isDirectory()) {
                    await copyDirectoryRecursiveSync(source, destination);
                } else {
                    await fs.promises.copyFile(source, destination);
                }
            }
        } catch (error) {
            console.error(`Error copying ${item}: ${error}`);
        }
    }

    const baseExclusions = new Set([
        'pearai.pearai',
        'ms-python.vscode-pylance',
        'ms-python.python',
        'codeium',
        'github.copilot',
        'continue'
    ]);

    // Add platform specific exclusions
    if (process.platform === 'darwin' && process.arch === 'arm64') {
        baseExclusions.add('ms-python.vscode-pylance');
        baseExclusions.add('ms-python.python');
        baseExclusions.add('ms-vscode-remote.remote-ssh');
        baseExclusions.add('ms-vscode-remote.remote-ssh-edit');
    }

    // Add platform specific exclusions
    if (process.platform === 'darwin' && process.arch === 'x64') {
        baseExclusions.add('ms-python.vscode-pylance');
        baseExclusions.add('ms-python.python');
        baseExclusions.add('ms-vscode-remote.remote-ssh');
        baseExclusions.add('ms-vscode-remote.remote-ssh-edit');
    }
    // // Add Windows specific exclusions
    // if (process.platform === 'win32') {
    // }

    // Add Linux specific exclusions
    // if (process.platform === 'linux') {
    // }

    await copyDirectoryRecursiveSync(vscodeExtensionsDir, pearAIDevExtensionsDir, Array.from(baseExclusions));
}

function getVSCodeSettingsDir() {
    const platform = process.platform;
    if (platform === 'win32') {
        return path.join(process.env.APPDATA || '', 'Code', 'User');
    } else if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User');
    } else {
        return path.join(os.homedir(), '.config', 'Code', 'User');
    }
}

async function copyDirectoryRecursiveSync(source: string, destination: string, exclusions: string[] = []) {
    await fs.promises.mkdir(destination, { recursive: true });

    const items = await fs.promises.readdir(source);
    for (const item of items) {
        const sourcePath = path.join(source, item);
        const destinationPath = path.join(destination, item);

        const shouldExclude = exclusions.some(exclusion =>
            sourcePath.toLowerCase().includes(exclusion.toLowerCase())

        );

        if (!shouldExclude) {
            const stats = await fs.promises.lstat(sourcePath);
            if (stats.isDirectory()) {
                await copyDirectoryRecursiveSync(sourcePath, destinationPath, exclusions);
            } else {
                await fs.promises.copyFile(sourcePath, destinationPath);
            }
        }
    }
}


export async function importUserSettingsFromVSCode() {
    try {
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 1000)), // Take at least one second
          copyVSCodeSettingsToPearAIDir(),
        ]);
        return true;
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy settings: ${error}`);
        return false;
      }
    }

export async function markCreatorOnboardingCompleteFileBased() {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const flagFile = firstPearAICreatorLaunchFlag;
        const productName = 'PearAI Creator';

        const exists = await fs.promises.access(flagFile).then(() => true).catch(() => false);
        if (!exists) {
            await fs.promises.writeFile(flagFile, `This is the first launch flag file for ${productName}`);
        }
    } catch (error) {
        console.error('Error marking creator onboarding complete:', error);
    }
}
