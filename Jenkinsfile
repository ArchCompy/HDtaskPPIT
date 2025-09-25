pipeline {
    agent any

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
                // Run npm install and test inside a temporary container
                sh 'docker-compose run --rm bookstore-app npm install'
                sh 'docker-compose run --rm bookstore-app npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo "Running code quality checks..."
                // eeeeeexample: ESLint; replace with your preferred tool
                sh 'docker-compose run --rm bookstore-app npm run lint || true'
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
