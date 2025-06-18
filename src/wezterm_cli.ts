import { CommandExecutor } from "./command_executor.ts";

export class DependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DependencyError";
  }
}

interface WeztermPane {
  pane_id: number;
  workspace: string;
  is_active: boolean;
}

export class WeztermCLI {
  constructor(skipValidation = false) {
    if (!skipValidation) {
      this.validateDependencies();
    }
  }

  async createWindow(rootDir: string, workspaceName: string): Promise<void> {
    const cmd = `wezterm cli spawn --cwd "${rootDir}" --new-window --workspace "${workspaceName}"`;
    await CommandExecutor.execute(cmd);
  }

  async getPaneId(workspaceName: string): Promise<number> {
    const cmd = "wezterm cli list --format json";
    const jsonOutput = await CommandExecutor.execute(cmd);
    const panes: WeztermPane[] = JSON.parse(jsonOutput);
    const pane = panes.find((p) => p.workspace === workspaceName);

    if (!pane) {
      throw new Error(`No pane found for workspace: ${workspaceName}`);
    }

    return pane.pane_id;
  }

  async sendCommand(paneId: number, command: string): Promise<void> {
    const cmd = `wezterm cli send-text '${command}' --pane-id ${paneId}`;
    await CommandExecutor.executeSilent(cmd);
  }

  async splitPane(paneId: number, rootDir: string): Promise<number> {
    const cmd = `wezterm cli split-pane --pane-id ${paneId} --right --cwd "${rootDir}"`;
    const result = await CommandExecutor.execute(cmd);
    return parseInt(result, 10);
  }

  private async validateDependencies(): Promise<void> {
    const cmd = "command -v wezterm >/dev/null 2>&1";
    const success = await CommandExecutor.executeSilent(cmd);

    if (!success) {
      throw new DependencyError("wezterm is required. Please install it");
    }
  }
}
