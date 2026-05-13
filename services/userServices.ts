import userSchema from "../schemas/userSchema";

export async function getUserById(id: string) {
  const user = await userSchema.findById(id);
  if (!user) throw new Error("User not found");

  return {
    username: user.username,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  };
}
