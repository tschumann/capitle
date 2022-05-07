#!/bin/bash

set -eu

cd $(dirname "${BASH_SOURCE[0]}")

sudo apt-get -y install nginx

# install the Capitle site configuration
sudo cp capitle.conf /etc/nginx/sites-enabled

sudo cp index.html /var/www/sites/capitle
sudo cp capitle.js /var/www/sites/capitle
sudo cp styles.css /var/www/sites/capitle
sudo cp sitemap.xml /var/www/sites/capitle

sudo service nginx restart
