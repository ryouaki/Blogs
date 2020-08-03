http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;
    
    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_comp_level 3;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    gzip_vary off;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

     server {
        listen 80;
        root /home/R-UI/build;
        error_page 404 = /;
        server_name blog.mkbug.com;
        location / {
            index index.html;
            add_header Cache-Control no-store;
            if ($request_filename ~ .*\.(gif|jpg|jpeg|png|css|js|ico|ttf|eot|svg)$) {
                add_header Cache-Control max-age=86400;
            } 
            try_files $uri $uri/ index.html;
        }
    }
    server {
        listen 80;
        root /home/doc.mkbug.com/website/build/doc.mkbug.com;
        error_page 404 = /;
        server_name doc.mkbug.com;
        location / {
            index index.html;
            add_header Cache-Control no-store;
            if ($request_filename ~ .*\.(gif|jpg|jpeg|png|css|js|ico|ttf|eot|svg)$) {
                add_header Cache-Control max-age=86400;
            }
            try_files $uri $uri/ index.html;
        }
    }
    server {
        listen 80;
        server_name web.static.mkbug.com;
        location / {
           root /home/web-static;
           add_header 'Access-Control-Max-Age' 86400;
           add_header 'Access-Control-Allow-Methods' 'GET';
           add_header 'Access-Control-Allow-Headers' 'content-type';
           add_header 'Access-Control-Allow-Origin' '*';

        }
    }
    server {
        listen 80;
        server_name web.account.mkbug.com;
        root /home/web-account/build;
        location / {
            index index.html;
            add_header Cache-Control no-store;
            if ($request_filename ~ .*\.(gif|jpg|jpeg|png|css|js|ico|ttf|eot|svg)$) {
                add_header Cache-Control max-age=86400;
            }
            try_files $uri $uri/ index.html;
        }
    }
}
