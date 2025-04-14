# Paso 1: Imagen base con Node.js (versión 21 en Alpine)
FROM node:21-alpine3.19 AS build

# Paso 2: Establece el directorio de trabajo
WORKDIR /app

# Paso 3: Copia los archivos de configuración y dependencias
COPY package.json package-lock.json ./

# Paso 4: Instala dependencias antes de copiar el código fuente completo (para aprovechar cacheo de capas)
RUN npm install

# Paso 5: Copia el resto de los archivos de la aplicación
COPY . .

# Paso 6: Construye la aplicación React
RUN npm run build

# Paso 7: Usa Nginx para servir la aplicación
FROM nginx:alpine


# Paso 9: Copia los archivos de la aplicación React construida desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar otros archivos, como los de `public`
COPY ./public/files /usr/share/nginx/html/public/files

#Elimina la Configuracion que viene default Nginx
RUN rm /etc/nginx/conf.d/default.conf  

# Paso 8: Copia la configuración personalizada de Nginx (opcional, si necesitas una configuración específica)
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 para acceso web
EXPOSE 5173

# Paso 10: Ejecuta Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
