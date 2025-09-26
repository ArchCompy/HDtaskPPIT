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
                
                    // sonarcloud analysis
                    echo "Running SonarCloud analysis..."

                    // cleaning up any previous scanner installations
                    sh 'rm -rf sonar-scanner-* .scannerwork || true'

                    sh """
            # Install Node.js 20 manually (ARM64 tarball)
            curl -sSLo node.tar.xz https://nodejs.org/dist/v20.17.0/node-v20.17.0-linux-arm64.tar.xz
            tar -xf node.tar.xz -C /usr/local --strip-components=1
            node -v
            which node

            # Download and unpack SonarScanner
            curl -sSLo sonar-scanner.zip "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-aarch64.zip"
            unzip -oq sonar-scanner.zip
            chmod +x sonar-scanner-${SONAR_SCANNER_VERSION}-linux-aarch64/bin/sonar-scanner

            # Run SonarScanner with explicit Node executable
            ./sonar-scanner-${SONAR_SCANNER_VERSION}-linux-aarch64/bin/sonar-scanner \\
                -Dsonar.projectKey=ArchCompy_HDtaskPPIT \\
                -Dsonar.organization=archcompy \\
                -Dsonar.host.url=https://sonarcloud.io \\
                -Dsonar.token=\$SONAR_TOKEN \\
                -Dsonar.sources=. \\
                -Dsonar.exclusions=node_modules/**,__tests__/**,sonar-scanner-*/**,*.zip \\
                -Dsonar.projectName="Bookstore Pipeline" \\
                -Dsonar.sourceEncoding=UTF-8 \\
                -Dsonar.javascript.node.maxspace=4096 \\
                -Dsonar.nodejs.executable=/usr/local/bin/node \\
                -X
        """
                // -Dsonar.verbose=true \\ add again if want additional debugging in console
            }
        }

        stage('Security') {
            steps {
                echo 'Security stage: scanning with Snyk...'
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'TOKEN')]) {
                   sh """
                        
                        docker-compose run --rm -e SNYK_TOKEN=\$TOKEN bookstore-app sh -c \\
                            "snyk test --all-projects --json > snyk-report.json || true"

                        docker-compose run --rm -e SNYK_TOKEN=\$TOKEN bookstore-app sh -c \\
                            "snyk monitor --all-projects || true"
                    """

                    // archiving the JSON report in Jenkins
                    archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
                sh 'docker-compose up -d'
            }
        }

        stage('Release') {
            steps {
                echo 'Building Docker image for release...'
                script {
                    def imageName = "your-dockerhub-username/bookstore-app"  // defining image name
                    def imageTag = "${env.BUILD_NUMBER}"  // gives image a numbered tag

                    // builds docker image in workspace with above defined tag
                    sh "docker build -t ${imageName}:${imageTag} ."
                    // packages code into docker image that can later be deployed

                    echo "Docker image built: ${imageName}:${imageTag}"
        }
    }
}

    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}
