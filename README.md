# fakesharper

![marketplace](https://img.shields.io/visual-studio-marketplace/v/fakesharper.fakesharper?style=flat-square)
![license](https://img.shields.io/github/license/fakesharper/fakesharper?style=flat-square)

![fakesharper](https://raw.githubusercontent.com/fakesharper/fakesharper/master/assets/icon.png)

This is vscode extension for (free) ReSharper.

![example](https://raw.githubusercontent.com/fakesharper/fakesharper/master/assets/example.gif)

> Warning: If your project is too large, this command can work slowly, because of cli tool. This is why we made this extension as command.

## FAQ

### Is ReSharper free?

**Yes!** We use free tool of [JetBrains](https://www.jetbrains.com/) [ReSharper](https://www.jetbrains.com/resharper/) called [ReSharper Command Line Tool](https://www.jetbrains.com/resharper/features/command-line.html) for this extension.

## Requirements

* [ReSharper CLT](https://www.jetbrains.com/resharper/features/command-line.html):
  * Download from [here](https://www.jetbrains.com/resharper/download/#section=commandline).
  * Extract files to any folder.
  * Add folder to environment PATH variable.
  * Check if installed correctly by `inspectcode --version` command on command line.

## Release Notes

### 1.0.0

* Added `Inspect Code` command.
* Added `Clean Diagnostics` command for the clean diagnostics on current editor.
* Added `Clean All Diagnostics` command for the clean all diagnostics on workspace.

-----------------------------------------------------------------------------------------------------------

## Thanks

[JetBrains](https://www.jetbrains.com/) for the free awesome [ReSharper](https://www.jetbrains.com/resharper/) [CLT](https://www.jetbrains.com/resharper/features/command-line.html) tool.

**Enjoy!**
