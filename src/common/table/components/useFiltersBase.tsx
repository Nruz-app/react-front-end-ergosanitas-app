import { IFilterBase } from '../interface/table.interface';
import { useCallback, useState } from "react";

export default function useFiltersBase(
  columnDefaultSelected: string,
  orderByDefaultSelected: string = "asc"
): {
  filterBase: IFilterBase;
  changeSearch: (search: string) => void;
  changeOrderBy: (orderBy: string) => void;
  changeColumnSelected: (columnSelected: string) => void;
} {
  const [filterBase, setFilterBase]: [
    IFilterBase,
    React.Dispatch<React.SetStateAction<IFilterBase>>,
  ] = useState<IFilterBase>({
    search: "",
    orderBy: orderByDefaultSelected,
    columnSelected: columnDefaultSelected,
  });

  const changeSearch = useCallback(
    (search: string): void => {
      setFilterBase({ ...filterBase, search });
    },
    [filterBase]
  );

  const changeOrderBy = useCallback(
    (orderBy: string): void => {
      setFilterBase({ ...filterBase, orderBy });
    },
    [filterBase]
  );

  const changeColumnSelected = useCallback(
    (columnSelected: string): void => {
      setFilterBase({ ...filterBase, columnSelected });
    },
    [filterBase]
  );

  return {
    filterBase,
    changeSearch,
    changeOrderBy,
    changeColumnSelected,
  };
}
