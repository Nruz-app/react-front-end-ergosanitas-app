import { SSObject } from "../interface/sso-object.model";

export const createSSOAdapter = (endpointSSO: any): SSObject => {
  const adaptedSSObject: SSObject = {
    token: endpointSSO.token,
    roles: endpointSSO.roles,
    viewRoles: Array.isArray(endpointSSO.viewsRoles) ? endpointSSO.viewsRoles.map((viewRole: any) => ({
      read: viewRole.read,
      write: viewRole.write,
      update: viewRole.update,
      delete: viewRole.delete,
      view: {
        id: viewRole.view.id,
        title: viewRole.view.title,
        url: viewRole.view.url,
      },
    })) : [],
  }

  return adaptedSSObject;
}
