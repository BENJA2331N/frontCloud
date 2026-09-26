export const environment = {
  production: false,
  apiBaseUrl: 'https://<tu-api-id>.execute-api.<region>.amazonaws.com/prod',
  azure: {
    // Si tienes tu Client ID y Tenant ID reales de Entra ID, úsalos aquí
    clientId: '5805f927-e607-48f6-bcdb-c97e93a8f6dd', // <CLIENT_ID_DEL_FRONTEND>
    authority: 'https://login.microsoftonline.com/c8d0fa9a-8d78-47b0-b443-f5419b74a5a8', // https://login.microsoftonline.com/<TENANT_ID>
    redirectUri: 'http://localhost:5173',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    protectedResourceScopes: ['api://<API_CLIENT_ID>/access_as_user']
  }
};
