# Use a Node.js image
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json /app/

# Install app dependencies
RUN npm install --ignore-scripts

# Bundle app source
COPY . /app

# Build the project
RUN npm run build

# Use a smaller image for the production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and node modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Set environment variables
ENV BFL_API_KEY=your_flux_api_key

# Expose the port that the app listens on
EXPOSE 3000

# Start the server
CMD ["node", "build/index.js"]
