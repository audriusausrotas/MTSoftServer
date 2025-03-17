export default (
  res: any,
  success: boolean,
  data: any = null,
  message: string = ""
) => {
  return res.send({ success, data, message });
};
