# This is a markdown file and should not be treated as a YAML file

## NOTA Agregar esta ruta en .helmignore

# Nota Importante:

## Crear Confirg Map
```
kubectl create configmap  ergosanitas-config --from-literal=VITE_API=https://ergosanitas.com --from-literal=VITE_API_PATH=/BackEnd/public/api --dry-run=client -o yaml | kubectl apply -f -
```

## Crear Secret
```
kubectl create secret generic ergosanitas-secret --from-literal=VITE_GOOGLE_CLIENT_ID=779646845225-23fbe2g5svfij391c6v7jeq7ltp5cuei.apps.googleusercontent.com --from-literal=VITE_MAPBOX_KEY=pk.eyJ1IjoibnJ1eiIsImEiOiJjbHp4MXdvY3Mwb2NtMm5wbnFnZ2FkbG9vIn0.0Zu0IButCWD-RFkE-IIXzQ --dry-run=client -o yaml | kubectl apply -f -
```

## Crear Deploy 
``` 
kubectl create deployment ergosanitas --image=nruz176/react-front-end-ergosanitas-app --dry-run=client -o yaml > ergosanitas-deployment.yml
```

## Crear Service 
```
kubectl create service nodeport ergosanitas-service --tcp=5173 --dry-run=client -o yaml > ergosanitas-service.yml
```
