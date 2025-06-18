import * as yaml from "jsr:@std/yaml";
import * as path from "jsr:@std/path";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface YamlConfig {
  root: string;
  pre_window?: string;
  workspaces: Array<Record<string, WorkspaceContent>>;
}

export type WorkspaceContent = string | {
  panes?: string[];
  root?: string;
};

export class Configuration {
  private configFile: string;

  constructor(fileName: string) {
    const configDir = this.getConfigDir();
    this.configFile = path.join(configDir, `${fileName}.yml`);
    this.validateFileExists();
    this.validateYamlSyntax();
  }

  async load(): Promise<YamlConfig> {
    const content = await Deno.readTextFile(this.configFile);
    const config = yaml.parse(content) as YamlConfig;

    // Expand ~ in root path
    config.root = this.expandPath(config.root);

    // Expand ~ in workspace-specific root paths
    for (const workspace of config.workspaces) {
      for (const content of Object.values(workspace)) {
        if (typeof content === "object" && content.root) {
          content.root = this.expandPath(content.root);
        }
      }
    }

    return config;
  }

  getConfigPath(): string {
    return this.configFile;
  }

  private expandPath(pathStr: string): string {
    if (pathStr.startsWith("~/")) {
      const homeDir = Deno.env.get("HOME");
      if (!homeDir) {
        throw new ConfigError("HOME environment variable not set");
      }
      return path.join(homeDir, pathStr.slice(2));
    }
    return pathStr;
  }

  private getConfigDir(): string {
    const envHome = Deno.env.get("WEZTERMINATOR_HOME");
    if (envHome) {
      return envHome;
    }

    const homeDir = Deno.env.get("HOME");
    if (!homeDir) {
      throw new ConfigError("HOME environment variable not set");
    }

    return path.join(homeDir, ".config", "wezterminator");
  }

  private validateFileExists(): void {
    try {
      const stat = Deno.statSync(this.configFile);
      if (!stat.isFile) {
        throw new ConfigError(`Configuration path is not a file: ${this.configFile}`);
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new ConfigError(`Configuration file not found: ${this.configFile}`);
      }
      throw error;
    }
  }

  private validateYamlSyntax(): void {
    try {
      const content = Deno.readTextFileSync(this.configFile);
      yaml.parse(content);
    } catch (error) {
      if (error instanceof Error && error.name === "YAMLError") {
        throw new ConfigError(`Invalid YAML syntax in ${this.configFile}: ${error.message}`);
      }
      throw error;
    }
  }
}
