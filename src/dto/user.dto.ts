export interface UserCreateDTO {
  username: string;
  password: string;
}

export interface UpdateUserDTO {
  username?: string;
}

export interface DeleteUserDTO {
  password: string;
}
