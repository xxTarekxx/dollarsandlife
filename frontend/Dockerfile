# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18 AS build-stage
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./

# Clean npm cache, remove node_modules and package-lock.json
RUN yarn cache clean --force && rm -rf node_modules yarn.lock

# Install dependencies
RUN yarn install --verbose

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.17.1-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Adjusting the path to reflect the relative location in the root
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
