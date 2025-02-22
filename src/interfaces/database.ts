export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  instance<T>(): T;
}
