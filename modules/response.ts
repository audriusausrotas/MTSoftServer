export default (res: any, success: boolean, data: any, message: string) => {
  return res.send({ success, data, message });
};
