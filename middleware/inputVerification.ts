import response from "../modules/response";

export default async (req: any, res: any, next: any) => {
  const { username, email, password, retypePassword } = req.body;

  if (retypePassword && password !== retypePassword)
    return response(res, false, null, "Slaptažodžiai nesutampa");

  if (email) {
    if (!email.includes("@")) return response(res, false, null, "Neteisingas elektroninis paštas");
    if (email.length < 4) return response(res, false, null, "Elektroninis paštas per trumpas");
  }

  if (username) {
    if (username.length < 4) return response(res, false, null, "Vartotojo vardas per trumpas");
    if (username.length > 20) return response(res, false, null, "Vartotojo vardas per ilgas");
  }

  if (password) {
    if (password.length < 4) return response(res, false, null, "Slaptažodis per trumpas");
    if (password.length > 20) return response(res, false, null, "Slaptažodis per ilgas");
  }

  next();
};
