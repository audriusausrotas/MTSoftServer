import userSessionSchema from "../schemas/userSessionSchema";

export default {
  saveNewUser: async (user: any) => {
    try {
      await userSessionSchema.findOneAndUpdate(
        { userID: user.userID },
        {
          socketID: user.socketID,
          accountType: user.accountType,
          username: user.username,
          email: user.email,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.log("Klaida pridedant naują vartotoją" + error);
    }
  },

  getUsers: async () => {
    try {
      return await userSessionSchema.find();
    } catch (error) {
      console.log("Klaida gaunant vartotojus" + error);
    }
  },

  getUser: async (socketID: string) => {
    try {
      return await userSessionSchema.findOne({ socketID });
    } catch (error) {
      console.log("Klaida gaunant vartotoją" + error);
    }
  },

  deleteUser: async (socketID: string) => {
    try {
      await userSessionSchema.deleteOne({ socketID });
    } catch (error) {
      console.error("Klaida trinant vartotoją:" + error);
    }
  },
};
