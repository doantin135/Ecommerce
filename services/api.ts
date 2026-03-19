const API_URL = "https://cryptographical-claudia-nonstatutable.ngrok-free.dev/api";

const fetchAPI = (path: string, method = "GET", body?: object) =>
  fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());

// Products
export const productAPI = {
  getAll: (params?: {
    search?: string;
    category_id?: number;
    badge?: string;
    page?: number;
    per_page?: number;
  }) => {
    const query = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return fetchAPI(`/products${query}`);
  },
  getOne: (id: number) => fetchAPI(`/products/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => fetchAPI("/categories"),
  getOne: (id: number) => fetchAPI(`/categories/${id}`),
};

export const reviewAPI = {
  getAll: (productId: number) =>
    fetchAPI(`/products/${productId}/reviews`),

  create: (productId: number, data: {
    user_id: string;
    user_name: string;
    rating: number;
    comment?: string;
  }) =>
    fetchAPI(`/products/${productId}/reviews`, "POST", data),

  delete: (reviewId: number, userId: string) =>
    fetchAPI(`/reviews/${reviewId}`, "DELETE", { user_id: userId }),
};
export default fetchAPI;