FROM openjdk:17-jdk-alpine

WORKDIR /ChatApp

COPY target/ChatBot-0.0.1-SNAPSHOT.jar ChatApp.jar

EXPOSE 8080

CMD ["java", "-jar", "ChatApp.jar"]