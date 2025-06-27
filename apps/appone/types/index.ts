// Define the Product type
export type Product = {
  title: string;
  category: string;
  price: number;
};

export interface ApiValidationError {
  field: string | (string | number)[];
  message: string;
  code?: string;
}
