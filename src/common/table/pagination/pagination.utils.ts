export const getCountTotalPages = (
    totalElements: number,
    itemsPerPage: number
  ): number => {
    return Math.ceil(totalElements / itemsPerPage);
  };
  
  export const getIndexOfFirstItem = (
    currentPage: number,
    itemsPerPage: number
  ): number => {
    return currentPage * itemsPerPage - itemsPerPage;
  };
  
  export const getIndexOfLastItem = (
    currentPage: number,
    itemsPerPage: number
  ): number => {
    return currentPage * itemsPerPage;
  };
  
  export const getElementsPerPage = <T>(
    elements: T[],
    currentPage: number,
    itemsPerPage: number
  ): T[] => {
    const indexOfFirstItem: number = getIndexOfFirstItem(
      currentPage,
      itemsPerPage
    );
    const indexOfLastItem: number = getIndexOfLastItem(currentPage, itemsPerPage);
    return elements.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  export const filterElementsBySearch = <T extends object>(
    elements: T[],
    search: string,
    filterableColumns: string[]
  ): T[] => {
    let items: T[] = elements.filter((item: T) => {
      const dtoKeys = getObjectKeys<T>(item);
      return dtoKeys.some((key: keyof T) => {
        if (!filterableColumns.includes(String(key))) {
          return false;
        }
        return String(item[key]).toLowerCase().includes(search.toLowerCase());
      });
    });
  
    return items;
  };
  
  const getObjectKeys = <T extends object>(dto: T): Array<keyof T> => {
    return Object.keys(dto) as Array<keyof T>;
  };
  
  export const orderElementsByColumn = <T>(
    elements: T[],
    column: string,
    order: string = "asc"
  ): T[] => {
    return elements.sort((a: T, b: T) => {
      const key = column as keyof T;
      const aValue = a[key];
      const bValue = b[key];
  
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
  
      if (order === "asc") {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
  };
  
  export const applyFilterBase = <T extends object>(
    elements: T[],
    search: string,
    columnSelected: string,
    orderBy: string,
    filterableColumns: string[],
    currentPage: number,
    itemsPerPage: number
  ): {
    items: T[];
    totalPages: number;
  } => {
    let items: T[] = elements;
    if (search !== "") {
      items = filterElementsBySearch<T>(items, search, filterableColumns);
    }
    items = orderElementsByColumn<T>(items, columnSelected, orderBy);
    const totalElements: number = items.length;
    const totalPages: number = getCountTotalPages(totalElements, itemsPerPage);
  
    items = getElementsPerPage<T>(items, currentPage, itemsPerPage);
    return {
      items,
      totalPages,
    };
  };
  