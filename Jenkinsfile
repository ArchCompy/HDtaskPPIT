pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // SonarCloud token from Jenkins
        SONAR_SCANNER_VERSION = '6.2.1.4610'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo "Building Docker image with Docker Compose..."
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                echo "Running application tests..."
                // Run Jest directly using npx inside the container
                sh 'docker-compose run --rm bookstore-app npx jest'
            }
        }

        stage('Code Quality') {
            steps {
                script{
                    // sonarcloud analysis
                    echo "Running SonarCloud analysis..."

                    // cleaning up any previous scanner installations
                    sh 'rm -rf sonar-scanner-* .scannerwork'

                    sh """
                        curl -sSLo sonar-scanner.zip -L https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.2.0.5079-linux-aarch64.zip
                        unzip -o sonar-scanner.zip
                        export PATH=$PWD/sonar-scanner-7.2.0.5079-linux-aarch64/bin:$PATH

                        if ! command -v node &> /dev/null; then
                            echo "Installing Node.js..."
                            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
                            apt-get install -y nodejs
                        fi

                        sonar-scanner \\
                            -Dsonar.projectKey=ArchCompy_HDtaskPPIT \\
                            -Dsonar.organization=archcompy \\
                            -Dsonar.host.url=https://sonarcloud.io \\
                            -Dsonar.token=\$SONAR_TOKEN \\
                            -Dsonar.sources=. \\
                            -Dsonar.exclusions=node_modules/**,__tests__/**,sonar-scanner-*/**,*.zip \\
                            -Dsonar.projectName="Bookstore Pipeline" \\
                            -Dsonar.sourceEncoding=UTF-8 \\
                            -Dsonar.javascript.node.maxspace=4096
                        """
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
                //          sh 'docker-compose up -d'
            }
        }

    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}
