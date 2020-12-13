import { INSPECTION_COMMAND, JB_INSTALLATION_COMMAND } from "../constants";
import { spawn } from 'child_process';
import * as vscode from 'vscode';

export class JetBrainsInstaller {

	public constructor(
		private readonly output: vscode.OutputChannel) {
	}

	verifyInstallation() {
		this.output.appendLine('');
		const cp = spawn(INSPECTION_COMMAND, ["--version"], { shell: true });

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				this.runInstallation();
			}
			else {
				this.output.appendLine('Jetbrains already installed.');
			}
		});
	}

	private runInstallation() {
		this.output.appendLine('Running Jetbrains installation');
		const cp = spawn(JB_INSTALLATION_COMMAND, { shell: true });

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				this.output.appendLine('Problems to install Jetbrains.');
			}

			this.output.appendLine('Done.');
		});
	}
}
