# CondaSync ![Static Badge](https://img.shields.io/badge/status-beta-blue) ![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/thisdotmatt.condasync)
> Automatic Dependency Tracker

Most package managers, such as npm and yarn, update your dependency files the moment you make any changes to your environment. Conda (surprisingly) **does not**. Existing solutions require you to manually update your dependency list, which is tedious and prone to errors. 
<br><br>
CondaSync is a simple Visual Studio Code Extension that integrates directly into your environment and does the boring work for you.

### Features
- Track a conda environment through its entire life cycle with one command
- Automatically update and clean up your `environment.yml` (or similar) file
- Customize your dependency files in the settings

### Usage
Ensure you have the latest versions of [VSCode](https://code.visualstudio.com/) and [conda](https://docs.conda.io/en/latest/) installed, and have the Extension enabled in the `Extensions` sidebar.

1. Open a Python project of your choice
2. Enter the VSCode command line using <kbd>Control</kbd>+ <kbd>Shift</kbd> + <kbd>P</kbd>
3. Use the `Set Conda Environment` command and enter the name of your conda environment (e.g. my_env)
4. Stop customizing your IDE and start coding

### Contributing

Pull requests, bug reports, and feature requests are welcome! Please search existing [issues](https://github.com/thisdotmatt/CondaSync/issues) before creating a new one.

To run from source:
```
git clone https://github.com/thisdotmatt/CondaSync.git
cd CondaSync
npm install
npm run compile
```

You can now use VSCode's Debugger:
Run > Start Debugging, or use the `Run Extension` button in the VSCode footer.

### Changelog

For more detailed changelog, see [`full_changelog.md`](.github/full_changelog.md).
- **v0.2 (Aug 2, 2024):** Added Git Features
- **v0.1 (Aug 1, 2024):** Initial release


