import subprocess
import os
import platform

def check_command(command):
    try:
        subprocess.run([command, '--version'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_nodejs():
    node_version = "v20.15.0"  # Specify the version you want
    node_dist_url = f"https://nodejs.org/dist/{node_version}/node-{node_version}-linux-x64.tar.xz"

    # Download Node.js
    print("Downloading Node.js...")
    subprocess.run(['curl', '-o', 'node.tar.xz', node_dist_url], check=True)

    # Extract Node.js
    print("Extracting Node.js...")
    subprocess.run(['tar', '-xf', 'node.tar.xz'], check=True)

    # Move to a directory
    node_dir = f'node-{node_version}-linux-x64'
    os.environ['PATH'] = os.path.abspath(node_dir + '/bin') + ':' + os.environ['PATH']

    print("Node.js installed and PATH updated.")

def install_yarn():
    print("Installing Yarn...")
    subprocess.run(['npm', 'install', '--global', 'yarn'], check=True)
    print("Yarn installed.")

def main():
    if not check_command('node'):
        print("Node.js not found. Installing Node.js...")
        install_nodejs()

    if not check_command('npm'):
        print("npm not found. It should be installed with Node.js. Checking again...")
        if not check_command('npm'):
            print("npm installation failed. Exiting.")
            return

    if not check_command('yarn'):
        print("Yarn not found. Installing Yarn...")
        install_yarn()

    # Run yarn install
    print("Running 'yarn install'...")
    subprocess.run(['yarn', 'install'], check=True)

    # Run npm start
    print("Running 'npm run start'...")
    subprocess.run(['npm', 'run', 'start'], check=True)

if __name__ == "__main__":
    main()
