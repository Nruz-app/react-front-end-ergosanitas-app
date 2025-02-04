import {
    MenuItem,
    Pagination as PaginationMUI,
    Select,
    Stack,
  } from "@mui/material";
  
  export default function Pagination({
    itemsPerPage,
    currentPage,
    totalPages,
    changeItemsPerPage,
    changeCurrentPage,
    elementsPerPage = [30, 60, 90],
  }: {
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    changeItemsPerPage: (size: number) => void;
    changeCurrentPage: (page: number) => void;
    elementsPerPage?: number[];
  }): JSX.Element {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        style={{ paddingTop: "1rem" }}
      >
        <Select
          value={itemsPerPage}
          size="small"
          onChange={(e) => changeItemsPerPage(Number(e.target.value))}
        >
          {elementsPerPage.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
  
        <PaginationMUI
          count={totalPages}
          page={currentPage}
          shape="rounded"
          size="large"
          showFirstButton
          showLastButton
          onChange={(_e, value) => changeCurrentPage(value)}
        />
      </Stack>
    );
  }
  