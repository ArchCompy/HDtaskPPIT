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
                echo "Running SonarCloud analysis..."
                sh '''
                    docker run --rm \
                        -v $PWD:/usr/src \
                        -v $HOME/.sonar/cache:/opt/sonar-scanner/.sonar/cache \
                        -e SONAR_HOST_URL="https://sonarcloud.io" \
                        -e SONAR_LOGIN="$SONAR_TOKEN" \
                        sonarsource/sonar-scanner-cli
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
