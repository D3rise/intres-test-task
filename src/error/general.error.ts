export class NotFoundError extends Error {
  /**
   * Returns error with message about item that wasn't found
   * @param item Name of item that wasn't found
   * @returns New error with message formatted in "${item} not found" format
   */
  constructor(item: string) {
    super(item + " not found");
  }
}

export class AlreadyExistsError extends Error {
  /**
   * Returns error with message about item that already exists
   * @param item Name of item that already exists
   * @returns New error with message formatted in "${item} already exists" format
   */
  constructor(item: string) {
    super(item + " already exists");
  }
}
