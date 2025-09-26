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
            # installing Node.js 20 manually (ARM64 tarball)
            curl -sSLo node.tar.xz https://nodejs.org/dist/v20.17.0/node-v20.17.0-linux-arm64.tar.xz
            tar -xf node.tar.xz -C /usr/local --strip-components=1
            node -v
            which node

            # downloading and unpacking SonarScanner
            curl -sSLo sonar-scanner.zip "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-aarch64.zip"
            unzip -oq sonar-scanner.zip
            chmod +x sonar-scanner-${SONAR_SCANNER_VERSION}-linux-aarch64/bin/sonar-scanner

            # running SonarScanner with explicit Node executable
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
                script {
                    // Git tagging
                    sh 'git config user.email "archmaster321@gmail.com"'
                    sh 'git config user.name "ArchCompy"'
                    
                    sh "git tag -a v1.0.${env.BUILD_NUMBER} -m 'Release for build ${env.BUILD_NUMBER}'"
                    
                    // Push tags
                    withCredentials([usernamePassword(credentialsId: 'git-credentials', 
                                                        usernameVariable: 'GIT_USER', 
                                                        passwordVariable: 'GIT_PASS')]) {
                        sh "git push https://${GIT_USER}:${GIT_PASS}@github.com/ArchCompy/HDtaskPPIT.git --tags"
                    }
                    
                    echo "Release tagged as v1.0.${env.BUILD_NUMBER}"
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
