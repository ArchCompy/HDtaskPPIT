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
                // Run Jest directly using npx inside the container
                sh 'docker-compose run --rm bookstore-app npx jest'
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
