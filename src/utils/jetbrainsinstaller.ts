import { INSPECTION_COMMAND, JB_INSTALLATION_COMMAND } from "../constants";
import { execSync } from 'child_process';
import * as vscode from 'vscode';

export class JetBrainsInstaller {

	public constructor(
		private readonly output: vscode.OutputChannel) {
	}

	verifyInstallation() {
		this.output.appendLine('');
		try{
			execSync(`${INSPECTION_COMMAND} --version`).toString();
		} catch {
			this.runInstallation();
		}
	}

	private runInstallation() {
		this.output.appendLine('Running Jetbrains installation');

		try{
			const output = execSync(JB_INSTALLATION_COMMAND).toString();
			this.output.append(output);
			this.output.appendLine('Done.');
		} catch (error) {
			this.output.append(error.toString());
		}
	}
}
