FROM php:8.3.3-apache
RUN apt update
RUN a2enmod rewrite

# Instala o composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN php composer-setup.php --version=2.6.5 --install-dir=/bin --filename=composer
RUN php -r "unlink('composer-setup.php');"

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update \
    && apt-get install -y \
 autoconf  \
 libpq-dev \
 git \
 libicu-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && docker-php-ext-install calendar && docker-php-ext-enable calendar \
    && docker-php-ext-configure intl && docker-php-ext-install intl

COPY . /var/www/html
WORKDIR /var/www/html

# Define o ponto de entrada do contêiner
CMD ["apache2-foreground"]