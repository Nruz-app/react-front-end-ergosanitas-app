export interface IFilterBase {
    search: string;
    orderBy: string;
    columnSelected: string;
  }
  
  export interface IColumnsTable {
    id: number;
    displayName: string;
    column: string;
    isFilterable: boolean;
  }
  
  export interface IOrderBy {
    displayName: string;
    value: string;
    default?: boolean;
  }
  
  export interface IPagination {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  }
  