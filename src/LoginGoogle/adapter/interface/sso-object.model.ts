import { SSObjectInterface } from "./sso-objetc.interface";
import { viewsRoles } from "./views-Roles.interface";

export class SSObject implements SSObjectInterface {
  token: string = '';
  roles: string = '';
  viewRoles: viewsRoles[] = [{
    read: false,
    write: false,
    update: false,
    delete: false,
    view: {
      id: '',
      title: '',
      url: ''
    }
  }] 
}