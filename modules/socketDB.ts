export interface User {
  userID: string;
  socketID: string;
}

let DB: User[] = [];

export default {
  saveNewUser: (user: User): void => {
    DB.push(user);
  },
  getUsers: (): User[] => {
    return DB;
  },
  getUser: (id: string): User | undefined => {
    return DB.find((user: User) => user.userID === id);
  },
  deleteUser: (id: string): void => {
    DB = DB.filter((user: User) => user.socketID !== id);
  },
};
