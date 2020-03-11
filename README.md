# fakesharper

[![marketplace](https://img.shields.io/visual-studio-marketplace/v/fakesharper.fakesharper?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=fakesharper.fakesharper)
[![gitter.im](https://img.shields.io/gitter/room/fakesharper/community?style=flat-square)](https://gitter.im/fakesharper/community)
[![patreon](https://img.shields.io/badge/patreon-donate-green.svg?style=flat-square)](https://www.patreon.com/jaqra)
![license](https://img.shields.io/github/license/fakesharper/fakesharper?style=flat-square)

This is vscode extension for (free) ReSharper.

![example](https://raw.githubusercontent.com/fakesharper/fakesharper/master/assets/example.gif)

> Warning: If your project is too large, this command can work slowly, because of cli tool. This is why we made this extension as command.

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

## FAQ

### Is ReSharper free?

**Yes!** We use free tool of [JetBrains](https://www.jetbrains.com/) [ReSharper](https://www.jetbrains.com/resharper/) called [ReSharper Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool for this extension.

-----------------------------------------------------------------------------------------------------------

## Thanks

[JetBrains](https://www.jetbrains.com/) for the free awesome [ReSharper](https://www.jetbrains.com/resharper/) [Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool.

**Enjoy!**
