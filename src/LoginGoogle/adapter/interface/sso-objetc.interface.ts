import { viewsRoles } from "./views-Roles.interface";

export interface SSObjectInterface {
  token: string;
  roles: string;
  viewRoles: viewsRoles[];
}