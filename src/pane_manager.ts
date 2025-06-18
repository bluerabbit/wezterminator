import { WeztermCLI } from "./wezterm_cli.ts";

export class PaneManager {
  private weztermCLI: WeztermCLI;
  private preWindow?: string;

  constructor(weztermCLI: WeztermCLI, preWindow?: string) {
    this.weztermCLI = weztermCLI;
    this.preWindow = preWindow;
  }

  async createFirstPane(paneId: number, command: string): Promise<void> {
    const finalCommand = this.buildCommand(command);
    await this.weztermCLI.sendCommand(paneId, finalCommand);
  }

  async createAdditionalPanes(
    paneId: number,
    commands: string[],
    rootDir: string,
  ): Promise<void> {
    for (const command of commands) {
      const newPaneId = await this.weztermCLI.splitPane(paneId, rootDir);
      const finalCommand = this.buildCommand(command);
      await this.weztermCLI.sendCommand(newPaneId, finalCommand);
    }
  }

  buildCommand(command: string): string {
    return this.preWindow ? `${this.preWindow} && ${command}` : command;
  }
}
