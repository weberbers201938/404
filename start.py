import os
import subprocess

def check_installation(command):
    try:
        subprocess.run([command, '--version'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError:
        return False

def run_command(command):
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr.decode())
    else:
        print(result.stdout.decode())

def install_nvm():
    run_command('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash')
    run_command('export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"')
    run_command('[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"')
    run_command('[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"')

def install_node_and_tools():
    run_command('nvm install node')
    run_command('npm install -g yarn')

def main():
    if not check_installation('node'):
        print("Node.js is not installed. Installing...")
        install_nvm()
        install_node_and_tools()
    else:
        print("Node.js is already installed.")

    if not check_installation('npm'):
        print("npm is not installed. This should have been installed with Node.js.")
        install_node_and_tools()
    else:
        print("npm is already installed.")

    if not check_installation('yarn'):
        print("Yarn is not installed. Installing...")
        run_command('npm install -g yarn')
    else:
        print("Yarn is already installed.")

    print("Running 'yarn install'...")
    run_command('yarn install')

    print("Running 'npm run start'...")
    run_command('npm run start')

if __name__ == "__main__":
    main()
