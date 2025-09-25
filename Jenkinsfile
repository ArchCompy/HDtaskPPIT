pipeline {
    agent any // runs the pipeline on available agent

    stages {
        stage('Build') {
            steps {
                script {
                    sh 'echo "Running code quality checks..."'
                    //def appImage = docker.build("bookstore-app:latest")
                    //echo "Docker image built: ${appImage.id}"
                }
            }
        }
    }
}