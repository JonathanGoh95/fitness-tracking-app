import axios from "axios";

export const setupAxiosInterceptors = (onTokenExpired: () => void) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data?.error === "Token has expired!"
      ) {
        onTokenExpired();
      }
      return Promise.reject(error);
    }
  );
};