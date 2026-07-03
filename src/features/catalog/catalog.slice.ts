import { createAppSlice } from "@/store/create-app-slice";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface CatalogState {
  products: Product[];
}

const initialState: CatalogState = {
  products: [],
};

export const catalogSlice = createAppSlice({
  name: "catalog",
  initialState,
  reducers: {},
  selectors: {
    selectProducts: (state) => state.products,
  },
});

export const { selectProducts } = catalogSlice.selectors;
export default catalogSlice.reducer;
