# fakesharper

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/fakesharper/fakesharper/CI?logo=github&style=flat-square)
[![marketplace](https://img.shields.io/visual-studio-marketplace/v/fakesharper.fakesharper?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=fakesharper.fakesharper)
[![gitter.im](https://img.shields.io/gitter/room/fakesharper/community?style=flat-square)](https://gitter.im/fakesharper/community)
![license](https://img.shields.io/github/license/fakesharper/fakesharper?style=flat-square)

This is vscode extension for (free) ReSharper.

> Warning: If your project is too large, this command can work slowly, because of cli tool. This is why we made this extension as command.

## Inspect Code

![example](https://raw.githubusercontent.com/fakesharper/fakesharper/master/assets/example.gif)

## Dupfinder

![example](https://raw.githubusercontent.com/fakesharper/fakesharper-assets/master/dupfinder.gif)

## Requirements

* [ReSharper Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool:
  * Download from [here](https://www.jetbrains.com/resharper/download/#section=commandline).
  * Extract files to any folder.
  * Add folder to environment PATH variable.
  * Check if installed correctly by `inspectcode --version` command on command line.

## Features

* `Inspect Code`: Inspecting and linting.
* `Clean Diagnostics`: Clean diagnostics on current editor.
* `Clean All Diagnostics`: Clean all diagnostics on workspace.
* `Reload Diagnostics`: Show diagnostics on editor from all found inspectcode.xml files.
* `Cleanup Code`: Format and cleanup code.
* `Run Dupfinder`: Find duplicates in code.
* `Clean Duplicates`: Clean duplicates tree.

## FAQ

### Is ReSharper free?

**Yes!** We use free tool of [JetBrains](https://www.jetbrains.com/) [ReSharper](https://www.jetbrains.com/resharper/) called [ReSharper Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool for this extension.

### Does this extension make Visual Studio Code slower?

**No!** Currently fakesharper works as command. This extension works only when you run any command.

-----------------------------------------------------------------------------------------------------------

## Thanks

[JetBrains](https://www.jetbrains.com/) for the free awesome [ReSharper](https://www.jetbrains.com/resharper/) [Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool.

**Enjoy!**
