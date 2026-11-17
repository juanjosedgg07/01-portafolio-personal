# Colección Bruno

1. Abra la carpeta `bruno/` en Bruno y elija el entorno `local` o `produccion`.
2. Obtenga un idToken: inicie sesión en `/login`, o en la consola del navegador del sitio ejecute
   el flujo de Firebase Auth y copie `await user.getIdToken()`. Guárdelo en la variable secreta `idTokenAdmin`
   (y un usuario sin rol en `idTokenUsuario` para los casos 403).
3. Los secretos (`vars:secret`) no se guardan en los archivos: no terminan en Git.

Cada carpeta tiene: un caso exitoso, un `400`, un `401` y un `403`/`404`.
