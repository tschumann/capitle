#!/bin/bash

set -eu

cd $(dirname "${BASH_SOURCE[0]}")

sudo apt-get update
sudo apt-get -y install nginx

sudo mkdir -p /var/www/sites/capitle

# install the Capitle site configuration
sudo cp capitle.conf /etc/nginx/sites-enabled

sudo cp index.html /var/www/sites/capitle
sudo cp capitle.js /var/www/sites/capitle
sudo cp styles.css /var/www/sites/capitle
sudo cp country-capitals.json /var/www/sites/capitle
sudo cp favicon.png /var/www/sites/capitle
sudo cp sitemap.xml /var/www/sites/capitle

sudo service nginx restart
