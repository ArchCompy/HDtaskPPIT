# official Node.js runtime as a parent image
FROM node:18-alpine

# setting the working directory in the container
WORKDIR /app

# copying package.json and package-lock.json to the working directory
COPY package*.json ./

# installing application dependencies
RUN npm install

# copying the rest of the application source code to the working directory
COPY . .

# exposing the port your app runs on
EXPOSE 3000

# defining the command to run your app
CMD ["npm", "start"]