import subprocess
import os
import sys
import shutil

def install_nvm():
    """
    Installs NVM (Node Version Manager).
    """
    try:
        subprocess.check_call('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash', shell=True)
        print("NVM installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing NVM: {e}")
        sys.exit(1)

def install_node():
    """
    Installs Node.js using NVM.
    """
    nvm_dir = os.path.expanduser('~/.nvm')
    nvm_sh = os.path.join(nvm_dir, 'nvm.sh')

    if not os.path.exists(nvm_sh):
        install_nvm()

    node_version = "20.15.0"
    nvm_command = f'. {nvm_sh} && nvm install {node_version} && nvm use {node_version} && nvm alias default {node_version}'

    try:
        subprocess.check_call(nvm_command, shell=True, executable='/bin/bash')
        print(f"Node.js {node_version} installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing Node.js: {e}")
        sys.exit(1)

def install_yarn():
    """
    Installs Yarn globally using npm.
    """
    nvm_dir = os.path.expanduser('~/.nvm')
    nvm_sh = os.path.join(nvm_dir, 'nvm.sh')

    yarn_installed = shutil.which('yarn') is not None
    if not yarn_installed:
        try:
            subprocess.check_call(f'. {nvm_sh} && npm install -g yarn', shell=True, executable='/bin/bash')
            print("Yarn installed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error installing Yarn: {e}")
            sys.exit(1)

def check_node_yarn():
    """
    Checks if Node.js and Yarn are installed; if not, installs them.
    """
    node_installed = shutil.which('node') is not None
    yarn_installed = shutil.which('yarn') is not None

    if not node_installed:
        install_node()
    if not yarn_installed:
        install_yarn()
    else:
        print("Node.js and Yarn are already installed.")

def run_command(command):
    """
    Runs a shell command and exits the script if the command fails.
    """
    try:
        subprocess.check_call(command, shell=True, executable='/bin/bash')
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e}")
        sys.exit(1)

def main():
    check_node_yarn()

    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)

    nvm_dir = os.path.expanduser('~/.nvm')
    nvm_sh = os.path.join(nvm_dir, 'nvm.sh')

    # Check if node_modules exists
    if not os.path.exists(os.path.join(project_root, 'node_modules')):
        # Use NVM to run yarn install
        run_command(f'. {nvm_sh} && yarn install')
        print("Node.js packages installed successfully.")
    else:
        print("Node.js packages are already installed.")

    # Use NVM to run npm start
    try:
        subprocess.run(
            f'. {nvm_sh} && npm start',
            shell=True,
            check=True,
            executable='/bin/bash'
        )
    except subprocess.CalledProcessError as e:
        print(f"Error running 'npm start': {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
