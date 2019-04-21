const authMiddleware = async (
  resolve: any,
  root: any,
  args: any,
  context: any,
  info: any
) => {
  if (context.session.userId) {
  } else {
  }
  return resolve(root, args, context, info);
};

export default authMiddleware;
