pipeline {
    agent any

    tools {
        maven 'Maven3'
    }

    environment {
        DOCKER_BIN = 'C:\\Users\\Microsoft\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
        DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'
        KUBECONFIG = 'C:\\Users\\Microsoft\\.kube\\config'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build Java Microservices') {
            steps {
                bat 'mvn --batch-mode --no-transfer-progress clean package -DskipTests -f DiscoveryService/pom.xml'
                bat 'mvn --batch-mode --no-transfer-progress clean package -DskipTests -f AuthService/pom.xml'
                bat 'mvn --batch-mode --no-transfer-progress clean package -DskipTests -f CustomerService/pom.xml'
                bat 'mvn --batch-mode --no-transfer-progress clean package -DskipTests -f AccountService/pom.xml'
                bat 'mvn --batch-mode --no-transfer-progress clean package -DskipTests -f ApiGateway/pom.xml'
            }
        }

        stage('Build Frontend UI') {
            steps {
                bat '''
                    cd Frontend
                    call npm install
                    call npm run build
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    set PATH=%PATH%;%DOCKER_BIN%
                    set DOCKER_HOST=%DOCKER_HOST%
                    docker compose build
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                    set PATH=%PATH%;%DOCKER_BIN%
                    kubectl --kubeconfig %KUBECONFIG% apply -f k8s/
                '''
            }
        }

        stage('Verify Deployment Status') {
            steps {
                bat '''
                    set PATH=%PATH%;%DOCKER_BIN%
                    kubectl --kubeconfig %KUBECONFIG% get pods,svc
                '''
            }
        }
    }

    post {
        success {
            echo 'Banking Microservices Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check stage logs for details.'
        }
    }
}
