# Use the official Node.js LTS version as the base image
FROM node:18-alpine

# Install curl
RUN apk add --no-cache curl

# Create and set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your app runs on (3000 by default)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
