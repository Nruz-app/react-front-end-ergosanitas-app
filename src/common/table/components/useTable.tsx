import { useCallback, useState } from "react";

export default function useTable<T>(): {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  elements: T[];
  currentElements: T[];
  openFilters: boolean;
  changeCurrentPage: (page: number) => void;
  changeTotalPages: (totalPages: number) => void;
  changeItemsPerPage: (size: number) => void;
  changeElements: (elements: T[]) => void;
  changeCurrentElements: (elements: T[]) => void;
  toggleFilters: (open: boolean) => void;
} {
  const [openFilters, setOpenFilters]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false);

  const [elements, setElements]: [
    T[],
    React.Dispatch<React.SetStateAction<T[]>>,
  ] = useState<T[]>([]);

  const [currentElements, setCurrentElements]: [
    T[],
    React.Dispatch<React.SetStateAction<T[]>>,
  ] = useState<T[]>([]);

  const [currentPage, setCurrentPage]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState<number>(1);

  const [totalPages, setTotalPages]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState<number>(1);

  const [itemsPerPage, setItemsPerPage]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState(30);

  const changeItemsPerPage = useCallback((itemsPerPage: number): void => {
    setItemsPerPage(itemsPerPage);
  }, []);

  const changeCurrentPage = useCallback((currentPage: number): void => {
    setCurrentPage(currentPage);
  }, []);

  const changeTotalPages = useCallback(
    (totalPages: number): void => {
      if (currentPage > totalPages) {
        setCurrentPage(1);
      }
      setTotalPages(totalPages);
    },
    [currentPage]
  );

  const changeElements = useCallback((elements: T[]): void => {
    setElements(elements);
  }, []);

  const changeCurrentElements = useCallback((elements: T[]): void => {
    setCurrentElements(elements);
  }, []);

  const toggleFilters = useCallback((open: boolean): void => {
    setOpenFilters(open);
  }, []);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    elements,
    openFilters,
    currentElements,
    changeCurrentElements,
    changeItemsPerPage,
    changeCurrentPage,
    changeTotalPages,
    changeElements,
    toggleFilters,
  };
}
