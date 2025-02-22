export abstract class BaseEntity {
  public id: string = '';
  public createdAt: Date = new Date();
  public updatedAt: Date = new Date();
}
