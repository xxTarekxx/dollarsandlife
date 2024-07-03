# Use the official Nginx image from the Docker Hub
FROM nginx:1.17.1-alpine

# Copy the custom Nginx configuration file into the container
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
