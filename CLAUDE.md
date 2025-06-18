# CLAUDE.md

This file provides guidelines for Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Run tests**: `deno task test`
- **Type check**: `deno task check`
- **Code formatting**: `deno task fmt`
- **Static analysis**: `deno task lint`
- **Binary compilation**: `deno task compile`
- **Platform-specific compilation**: `deno task compile:mac`, `deno task compile:linux`, etc.
- **All platforms compilation**: `deno task compile:all`

## Architecture Overview

Wezterminator is a TypeScript/Deno application that manages Wezterm workspaces using YAML configuration files. Inspired by [tmuxinator](https://github.com/tmuxinator/tmuxinator), it follows a modular design.

### Key Components

- **CLI**: Main entry point that parses arguments and orchestrates workspace operations
- **Configuration**: Handles loading and validation of YAML configuration files from `~/.config/wezterminator/`
- **Workspace**: Core workspace management that creates windows and coordinates pane creation
- **PaneManager**: Manages individual panes within workspaces and handles command execution with pre_window support
- **WeztermCLI**: Wrapper for WezTerm CLI commands for window/pane operations
- **CommandExecutor**: Centralized command execution with error handling and debug logging

### Data Flow

1. CLI parses command (open/start/new/run) and configuration file name
2. Configuration loads and validates YAML from `~/.config/wezterminator/{name}.yml`
3. Workspace creates Wezterm window and delegates pane creation to PaneManager
4. PaneManager executes commands in panes, combining with pre_window commands when specified
5. WeztermCLI handles all direct Wezterm CLI operations (spawn, split-pane, send-text)

### Configuration Structure

YAML configuration supports:
- Global `root` directory and `pre_window` commands
- Workspace-specific `root` and `panes` array
- Single command or multi-pane configuration per workspace

### Debug System

Enable debug mode with `WEZTERMINATOR_DEBUG=1` environment variable or `--debug` flag. When debug is enabled, all Wezterm CLI commands are logged.

## Testing Environment

- **Test framework**: Deno standard test runner
- **Test structure**: Mirrors src/ directory structure (`*_test.ts` files)
- **Mocking**: Mock external commands using CommandExecutor
- **Execution**: Run tests with `deno task test`

## Code Conventions

- **Deno version**: 2.0 or higher
- **Language**: TypeScript (strict mode enabled)
- **Formatting**: Auto-format with `deno fmt` (120 character limit, semicolons required)
- **Linting**: Static analysis with `deno lint`
- **Naming conventions**: camelCase for functions/variables, PascalCase for classes/types, kebab-case for CLI commands
- **Error handling**: Centralized management with CommandExecutor, display appropriate error messages
- **Type safety**: Define all types explicitly with TypeScript strict mode

## Pre-commit Checklist

**IMPORTANT**: Always run the following commands before executing git commit:

```bash
# 1. Type check
deno task check

# 2. Format check
deno fmt --check

# 3. Format fix (if needed)
deno fmt

# 4. Lint
deno task lint

# 5. Run tests
deno task test
```

### Recommended Workflow

```bash
# Quality check after code changes
deno task check && deno fmt && deno task lint && deno task test

# Commit if all succeed
git add .
git commit -m "commit message"
```

### CI/CD Alignment

These checks are also run in GitHub Actions. By checking locally beforehand:
- Prevent CI failures
- Improve development efficiency
- Maintain code quality

## Version Management Rules

**IMPORTANT**: When creating a new git tag version, always follow these steps:

1. Update the version number in the `showVersion()` method in `src/cli.ts`
2. Ensure the git tag version matches the `showVersion()` version
3. Create a version bump commit and tag

Example:
```bash
# 1. Update version number (e.g., v0.0.1)
# Change to "wezterminator version 0.0.1" in showVersion() method in src/cli.ts

# 2. Commit
git add src/cli.ts
git commit -m "Bump version to 0.0.1"

# 3. Create tag
git tag v0.0.1

# 4. Push
git push origin master --tags
```

This procedure ensures that the version displayed by `wezterminator -v` always stays in sync with the git tag.
