export class Project {
  public id: string | null;
  public name: string;
  public client: string;
  public imageUrl: string | null;
  public isFavorite: boolean;
  public startDate: Date;
  public endDate: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string | null,
    name: string,
    client: string,
    imageUrl: string | null,
    isFavorite: boolean,
    startDate: Date,
    endDate: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.validateSchedule(startDate, endDate);

    this.id = id;
    this.name = name;
    this.client = client;
    this.imageUrl = imageUrl;
    this.isFavorite = isFavorite;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  favorite(): void {
    this.isFavorite = true;
    this.updatedAt = new Date();
  }

  unfavorite(): void {
    this.isFavorite = false;
    this.updatedAt = new Date();
  }

  rename(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  changeClient(client: string): void {
    this.client = client;
    this.updatedAt = new Date();
  }

  changeImageUrl(imageUrl: string | null): void {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  changeSchedule(startDate: Date, endDate: Date): void {
    this.validateSchedule(startDate, endDate);
    this.startDate = startDate;
    this.endDate = endDate;
    this.updatedAt = new Date();
  }

  private validateSchedule(startDate: Date, endDate: Date): void {
    if (endDate.getTime() < startDate.getTime()) {
      throw new RangeError(
        'endDate must be greater than or equal to startDate',
      );
    }
  }

  applyUpdate(input: {
    name?: string;
    client?: string;
    imageUrl?: string | null;
    isFavorite?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): void {
    if (input.name !== undefined) this.rename(input.name);
    if (input.client !== undefined) this.changeClient(input.client);
    if (input.imageUrl !== undefined) this.changeImageUrl(input.imageUrl);
    if (input.isFavorite !== undefined) {
      if (input.isFavorite) {
        this.favorite();
      } else {
        this.unfavorite();
      }
    }

    if (input.startDate !== undefined || input.endDate !== undefined) {
      const nextStartDate =
        input.startDate === undefined ? this.startDate : input.startDate;
      const nextEndDate =
        input.endDate === undefined ? this.endDate : input.endDate;

      this.changeSchedule(nextStartDate, nextEndDate);
    }
  }
}
