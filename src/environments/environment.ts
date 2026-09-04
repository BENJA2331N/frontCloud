export const environment = {
  production: false,
  azure: {
    clientId: '5805f927-e607-48f6-bcdb-c97e93a8f6dd',
    tenantId: 'c8d0fa9a-8d78-47b0-b443-f5419b74a5a8',
    authority: 'https://login.microsoftonline.com/c8d0fa9a-8d78-47b0-b443-f5419b74a5a8',
    redirectUri: 'http://localhost:5173',
    protectedResourceScopes: ['api://TU_API_ID_URI/TU_SCOPE']
  },
  apiBaseUrl: 'http://localhost:8080'
};
