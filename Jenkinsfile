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

        stage('Code Quality') {
            steps {
                // sonarcloud analysis
                echo "Running SonarCloud analysis..."
                sh '''
                docker-compose run --rm bookstore-app sh -c "
                curl -o sonar-scanner.zip -L https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.2.0.722025-linux.zip && \
                unzip -o sonar-scanner.zip && \
                export PATH=$PWD/sonar-scanner-7.2.0.722025-linux/bin:$PATH && \
                sonar-scanner -Dsonar.login=$SONAR_TOKEN
                "
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
