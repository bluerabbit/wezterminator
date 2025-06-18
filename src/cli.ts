#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

import * as path from "jsr:@std/path";
import { ensureDir } from "jsr:@std/fs";
import { Debug } from "./debug.ts";
import { ConfigError, Configuration, WorkspaceContent, YamlConfig } from "./configuration.ts";
import { WeztermCLI } from "./wezterm_cli.ts";
import { Workspace } from "./workspace.ts";

export class CLI {
  static async run(): Promise<void> {
    try {
      const args = [...Deno.args];
      this.parseDebugFlag(args);

      if (this.isVersionFlag(args)) {
        this.showVersion();
        return;
      }

      this.validateArgs(args);

      const [action, fileName, ...rest] = args;
      await this.handleAction(action, fileName, rest);
    } catch (error) {
      if (error instanceof ConfigError) {
        console.error(`Error: ${error.message}`);
        Deno.exit(1);
      }
      throw error;
    }
  }

  private static parseDebugFlag(args: string[]): void {
    const debugIndex = args.indexOf("--debug");
    if (debugIndex !== -1) {
      args.splice(debugIndex, 1);
      Debug.setEnabled(true);
    }
  }

  private static isVersionFlag(args: string[]): boolean {
    return args.includes("-v") || args.includes("--version");
  }

  private static showVersion(): void {
    console.log("wezterminator version 0.0.1");
  }

  private static async handleAction(
    action: string,
    fileName: string,
    rest: string[],
  ): Promise<void> {
    if (action === "new") {
      await this.createNewConfig(fileName);
      return;
    }

    const config = new Configuration(fileName);

    if (action === "edit") {
      await this.editConfig(config);
      return;
    }

    if (action === "run" && rest.length >= 1) {
      await this.runWorkspace(config, rest[0]);
      return;
    }

    await this.startWorkspaces(config);
  }

  private static getEditorCommand(): string {
    return Deno.env.get("EDITOR") || "vi";
  }

  private static async editConfig(config: Configuration): Promise<void> {
    const cmd = new Deno.Command(this.getEditorCommand(), {
      args: [config.getConfigPath()],
    });
    const { code } = await cmd.output();
    Deno.exit(code);
  }

  private static async createNewConfig(projectName: string): Promise<void> {
    const configDir = Deno.env.get("WEZTERMINATOR_HOME") ||
      path.join(Deno.env.get("HOME") || "", ".config", "wezterminator");

    await ensureDir(configDir);

    const configFile = path.join(configDir, `${projectName}.yml`);

    try {
      const stat = await Deno.stat(configFile);
      if (stat.isFile) {
        console.error(`Error: Configuration file already exists: ${configFile}`);
        Deno.exit(1);
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    await Deno.writeTextFile(configFile, this.defaultConfigContent());

    const cmd = new Deno.Command(this.getEditorCommand(), {
      args: [configFile],
    });
    const { code } = await cmd.output();
    Deno.exit(code);
  }

  private static defaultConfigContent(): string {
    return `root: ~/path/to/project

workspaces:
  - shell:
      panes:
        - # command 1
        - # command 2
  - app: # command
`;
  }

  private static async startWorkspaces(config: Configuration): Promise<void> {
    const yamlConfig = await config.load();
    const workspace = this.createWorkspace(yamlConfig);
    await this.createAllPanes(workspace, yamlConfig.workspaces);
  }

  private static async runWorkspace(
    config: Configuration,
    workspaceName: string,
  ): Promise<void> {
    const yamlConfig = await config.load();
    const workspaceItem = yamlConfig.workspaces.find(
      (item) => Object.keys(item)[0] === workspaceName,
    );

    if (!workspaceItem) {
      console.error(`Error: Workspace '${workspaceName}' not found`);
      Deno.exit(1);
    }

    const workspaceContent = workspaceItem[workspaceName];
    await this.executeWorkspaceCommand(yamlConfig, workspaceContent);
  }

  private static async executeWorkspaceCommand(
    yamlConfig: YamlConfig,
    workspaceContent: WorkspaceContent,
  ): Promise<void> {
    const rootDir = path.resolve(yamlConfig.root);
    const preWindow = yamlConfig.pre_window;
    const command = this.buildCommand(
      preWindow,
      typeof workspaceContent === "string" ? workspaceContent : "",
    );

    console.log(`Running: ${command}`);

    const cmd = new Deno.Command("sh", {
      args: ["-c", command],
      cwd: rootDir,
    });

    const { code } = await cmd.spawn().status;
    Deno.exit(code);
  }

  private static buildCommand(preWindow?: string, command?: string): string {
    if (!command) return "";
    return preWindow ? `${preWindow} && ${command}` : command;
  }

  private static createWorkspace(yamlConfig: YamlConfig): Workspace {
    const weztermCLI = new WeztermCLI();
    return new Workspace(
      weztermCLI,
      path.resolve(yamlConfig.root),
      yamlConfig.pre_window,
    );
  }

  private static async createAllPanes(
    workspace: Workspace,
    workspaces: Array<Record<string, WorkspaceContent>>,
  ): Promise<void> {
    for (const workspaceItem of workspaces) {
      const name = Object.keys(workspaceItem)[0];
      const content = workspaceItem[name];
      await workspace.create(name, content);
    }
  }

  private static validateArgs(args: string[]): void {
    if (args.length >= 2 && ["edit", "start", "new", "run"].includes(args[0])) {
      return;
    }

    console.error(`Usage: wezterminator [edit|start|new|run] <YAML filename (without extension)>`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await CLI.run();
}
