pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // SonarCloud token from Jenkins
    }
    
    stages {

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



stage('Install Node') {
    steps {
        sh '''
            apt-get update
            apt-get install -y nodejs npm
        '''
    }
}

stage('Check environment') {
    steps {
        sh '''
            echo "Current user: $(whoami)"
            echo "PATH=$PATH"
            echo "Docker info:"
            uname -a
            which node
            node -v || echo "Node not found"
        '''
    }
}




        stage('Code Quality') {
            steps {
                // sonarcloud analysis
                echo "Running SonarCloud analysis..."
                sh '''
                    rm -rf .scannerwork
                    curl -sSLo sonar-scanner.zip -L https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.2.0.5079-linux-aarch64.zip
                    unzip -o sonar-scanner.zip
                    export PATH=$PWD/sonar-scanner-7.2.0.5079-linux-aarch64/bin:$PATH
                    sonar-scanner -Dsonar.nodejs.executable=$(which node) -Dsonar.token=$SONAR_TOKEN
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying application..."
                sh 'docker-compose up -d'
            }
        }

    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}
