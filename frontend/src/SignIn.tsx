"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthContext } from "./auth/context";
import { useGoogleLogin } from "./auth/googleLogin";
import { useEmailPasswordLogin } from "./auth/emailPasswordLogin";
import { useEmailPasswordRegistration } from "./auth/emailPasswordRegistration";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Globe2, Shell } from "lucide-react";

const FormSchemaEmailPassword = z.object({
  email: z
    .string({
      required_error: "Email is required.",
    })
    .email({
      message: "Please enter a valid email.",
    }),
  password: z
    .string({
      required_error: "Password is required.",
    })
    .min(8, {
      message: "Password must be at least 8 characters.",
    }),
});

export default function SignIn() {

  const { user } = useAuthContext();
  const { googleLogin, isPendingGoogleLogin } = useGoogleLogin();
  const {
    emailPasswordLogin,
    errorEmailPasswordLogin,
    isPendingEmailPasswordLogin,
  } = useEmailPasswordLogin();
  const {
    emailPasswordRegistration,
    errorEmailPasswordRegistration,
    isPendingEmailPasswordRegistration,
  } = useEmailPasswordRegistration();


  const formEmailPassword = useForm<z.infer<typeof FormSchemaEmailPassword>>({
    resolver: zodResolver(FormSchemaEmailPassword),
  });

  async function onSubmitEmailPasswordLogin(
    data: z.infer<typeof FormSchemaEmailPassword>
  ) {
    await emailPasswordLogin(data.email, data.password);
  }
  async function onSubmitEmailPasswordRegistration(
    data: z.infer<typeof FormSchemaEmailPassword>
  ) {
    await emailPasswordRegistration(data.email, data.password);
  }

 

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full md:w-2/3 lg:w-1/2">
        {user ? (
          <div className="w-full flex flex-col items-center gap-4">
            <h1 className="text-center text-xl font-bold">Connected !</h1>
            <p>
              Hey{" "}
              <b className="italic underline underline-offset-4">
                {user.email}
              </b>{" "}
              👋
            </p>
            
            
          </div>
        ) : (
          <div className="content-center">
            <Button
          
              type="button"
              onClick={googleLogin}
              disabled={
                isPendingGoogleLogin ||
                isPendingEmailPasswordLogin ||
                isPendingEmailPasswordRegistration
              }
            >
              {isPendingGoogleLogin ? (
                <Shell className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Globe2 className="mr-2 h-4 w-4" />
              )}
              Sign in with Google
            </Button>
            <span className="flex font-semibold items-center justify-center my-6">
              OR
            </span>
        
            <Form {...formEmailPassword}>
              <form className="w-full space-y-6">
                <FormField
                  control={formEmailPassword.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="JohnDoe@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEmailPassword.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="enter password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="w-full flex items-center gap-2">
                  <Button
                    className=""
                    type="button"
                    disabled={
                      isPendingGoogleLogin ||
                      isPendingEmailPasswordLogin ||
                      isPendingEmailPasswordRegistration
                    }
                    onClick={formEmailPassword.handleSubmit(
                      onSubmitEmailPasswordLogin
                    )}
                  >
                    {isPendingEmailPasswordLogin && (
                      <Shell className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                  <Button
                    className=""
                    type="button"
                    disabled={
                      isPendingGoogleLogin ||
                      isPendingEmailPasswordLogin ||
                      isPendingEmailPasswordRegistration 
                    }
                    onClick={formEmailPassword.handleSubmit(
                      onSubmitEmailPasswordRegistration
                    )}
                  >
                    {isPendingEmailPasswordRegistration && (
                      <Shell className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Register
                  </Button>
                </div>
                {(errorEmailPasswordLogin ||
                  errorEmailPasswordRegistration) && (
                  <span className="text-red-500 text-center text-sm block mt-4 font-semibold">
                    {errorEmailPasswordLogin ===
                      "auth/invalid-login-credentials" &&
                      "Invalid email or password"}
                    <br />
                    {errorEmailPasswordRegistration ===
                      "auth/email-already-in-use" &&
                      "This user already exists "}
                  </span>
                )}
              </form>
            </Form>
          </div>
        )}
      </div>

    </main>
  );
}