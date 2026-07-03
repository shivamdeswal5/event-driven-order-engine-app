import { createAppSlice } from "@/store/create-app-slice";
import { listProductsAction } from "./list-products/list-products.action";
import { ProductResponse } from "./list-products/list-products.interface";

export interface CatalogState {
  products: ProductResponse[];
  loading: boolean;
}

const initialState: CatalogState = {
  products: [],
  loading: false,
};

export const catalogSlice = createAppSlice({
  name: "catalog",
  initialState,
  reducers: {},
  selectors: {
    selectProducts: (state) => state.products,
    selectCatalogLoading: (state) => state.loading,
  },
  extraReducers: (builder) => {
    builder
      .addCase(listProductsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(listProductsAction.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(listProductsAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { selectProducts, selectCatalogLoading } = catalogSlice.selectors;
export default catalogSlice.reducer;
