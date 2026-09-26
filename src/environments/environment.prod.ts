export const environment = {
  production: true,
  apiBaseUrl: 'https://<tu-api-id>.execute-api.<region>.amazonaws.com/prod',
  azure: {
    clientId: '5805f927-e607-48f6-bcdb-c97e93a8f6dd',
    authority: 'https://login.microsoftonline.com/c8d0fa9a-8d78-47b0-b443-f5419b74a5a8',
    redirectUri: 'https://<TU_DOMINIO_PRODUCCION>',
    postLogoutRedirectUri: 'https://<TU_DOMINIO_PRODUCCION>/login',
    protectedResourceScopes: ['api://5805f927-e607-48f6-bcdb-c97e93a8f6dd/access_as_user']
  }
};
