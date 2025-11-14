# TODO: Update import/index.html for new products table structure

- [x] Prepare products array from excelData: Map Excel columns to product fields (Brand, Description, Stock, Cost, PVP, Min, Code, Aux) and convert data types (integers for Stock, Min, Aux; floats for Cost, PVP).
- [x] Add frontend validation: Check that Aux is a unique integer across all rows; alert user if invalid data is found.
- [x] Update importBtn: Change to POST request sending the products array to '/products/import' (relative URL), with progress bar updates.
- [x] Remove or repurpose processBtn: Since import will handle data sending, remove the placeholder processBtn or repurpose it if needed.
- [ ] Test the import functionality with a sample Excel file and verify backend integration.
