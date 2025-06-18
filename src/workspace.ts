import * as path from "jsr:@std/path";
import { WeztermCLI } from "./wezterm_cli.ts";
import { PaneManager } from "./pane_manager.ts";
import { Debug } from "./debug.ts";
import { WorkspaceContent } from "./configuration.ts";

export class Workspace {
  private weztermCLI: WeztermCLI;
  private globalRoot: string;
  private paneManager: PaneManager;
  private counter = 1;

  constructor(weztermCLI: WeztermCLI, rootDir: string, preWindow?: string) {
    this.weztermCLI = weztermCLI;
    this.globalRoot = rootDir;
    this.paneManager = new PaneManager(weztermCLI, preWindow);
  }

  async create(name: string, content: WorkspaceContent): Promise<void> {
    const workspaceName = this.formatWorkspaceName(name);

    if (typeof content === "object" && "panes" in content && content.panes) {
      await this.createMultiPane(workspaceName, content as { panes: string[]; root?: string });
    } else {
      await this.createSinglePane(workspaceName, content);
    }
  }

  getWorkspaceRoot(content: WorkspaceContent): string {
    if (typeof content === "object" && "root" in content && content.root) {
      return path.resolve(content.root);
    }
    return path.resolve(this.globalRoot);
  }

  private formatWorkspaceName(name: string): string {
    const formatted = `${String(this.counter).padStart(2, "0")}:${name}`;
    this.counter++;
    return formatted;
  }

  private async createMultiPane(
    workspaceName: string,
    content: { panes: string[]; root?: string },
  ): Promise<void> {
    await this.setupWindow(workspaceName, content);
    const paneId = await this.weztermCLI.getPaneId(workspaceName);
    await this.paneManager.createFirstPane(paneId, content.panes[0]);

    if (content.panes.length > 1) {
      await this.paneManager.createAdditionalPanes(
        paneId,
        content.panes.slice(1),
        this.getWorkspaceRoot(content),
      );
    }
  }

  private async setupWindow(
    workspaceName: string,
    content: WorkspaceContent,
  ): Promise<void> {
    const rootDir = this.getWorkspaceRoot(content);
    await this.weztermCLI.createWindow(rootDir, workspaceName);
  }

  private async createSinglePane(
    workspaceName: string,
    content: WorkspaceContent,
  ): Promise<void> {
    const rootDir = this.getWorkspaceRoot(content);
    const command = typeof content === "string" ? content : "";
    const finalCommand = this.paneManager.buildCommand(command);

    const cmd = `wezterm cli spawn --cwd "${rootDir}" --new-window` +
      ` --workspace "${workspaceName}" -- zsh -i -c "${finalCommand}; exec zsh"`;

    Debug.logCommand(cmd);

    const denoCmd = new Deno.Command("sh", {
      args: ["-c", cmd],
      stdout: "null",
      stderr: "null",
    });

    await denoCmd.output();
  }
}
