export type ServiceResponse<T, E> = {
  data: T;
  error: null;
} | {
  data: null;
  error: E;
};
