
export interface viewsRoles {
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
    view: View;
}

export class View implements ViewInterface {
    id: string = '';
    title: string = '';
    url: string = '';

}

export interface ViewInterface {
    id: string;
    title: string;
    url: string;
  }