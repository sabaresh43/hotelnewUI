import routes from "@/data/routes";

const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: routes.login.path,
  },
  providers: [], // safe
};

export default authConfig;
