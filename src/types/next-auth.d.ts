import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
  }

  interface Account {
    access_token?: string;
  }
}
