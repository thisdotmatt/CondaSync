# CondaSync - Automatic Dependency Tracker

Most package managers, such as npm and yarn, update your dependency files the moment you make any changes to your environment. Conda (surprisingly) **does not**. Existing solutions require you to manually update your dependency list, which is tedious and prone to errors. 
<br><br>
CondaSync is a simple VSCode Extension that integrates directly into your environment and silently does the boring work for you.

### Usage

1. Open a Python project of your choice
2. Enter the VSCode command line using <kbd>Control</kbd>+ <kbd>Shift</kbd> + <kbd>P</kbd>
3. Type the `Set Conda Environment` command and enter the name of your conda environment (e.g. my_env)
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



