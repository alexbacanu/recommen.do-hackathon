"use client";

import type { OpenAISettings } from "~/lib/types";
import type { Models } from "appwrite";

import { zodResolver } from "@hookform/resolvers/zod";
import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { appwriteUrl } from "~/lib/envClient";
import { useAppwrite } from "~/lib/helpers/useAppwrite";
import { openAiSchema } from "~/lib/schema";

interface AccountProps {
  account: Models.User<Models.Preferences>;
  profile: Models.Document;
}

interface CustomWindow extends Window {
  next: any;
}
declare const window: CustomWindow;

export function Account({ account, profile }: AccountProps) {
  const { signOut } = useAppwrite();
  const { createJWT } = useAppwrite();

  const [loading, setLoading] = useState(false);

  const [openaiSettings, setOpenaiSettings, { remove }] = useStorage<OpenAISettings>("openaiSettings", {
    apiKey: undefined,
    orgName: undefined,
  });

  const apiKeyDetected = !!openaiSettings?.apiKey;
  const extensionDetected = !window.next;

  const form = useForm<OpenAISettings>({
    resolver: zodResolver(openAiSchema),
    defaultValues: {
      apiKey: "",
      orgName: "",
    },
  });

  let jwt: string;

  const handleSubscribe = async (priceId: string) => {
    if (!jwt) {
      const jwtToken = await createJWT();
      jwt = jwtToken.jwt;
    }

    const getCheckoutURL = await fetch(`${appwriteUrl}/api/stripe/subscription/${priceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const checkoutUrl = await getCheckoutURL.json();

    window.open(checkoutUrl.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    setLoading(true);

    if (!jwt) {
      const jwtToken = await createJWT();
      jwt = jwtToken.jwt;
    }

    const deleteAccounts = await fetch(`${appwriteUrl}/api/appwrite/delete`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (deleteAccounts.status === 200) {
      signOut().then(() => {
        window.open(`${appwriteUrl}`, "_blank", "noopener,noreferrer");
      });
    }

    setLoading(false);
  };

  return (
    <section id="account" className="grid grid-cols-1 gap-x-4 gap-y-6 lg:grid-cols-3 lg:gap-x-8">
      <Card>
        <CardHeader>
          <CardTitle>
            API key{" "}
            {extensionDetected && (
              <span className="text-muted-foreground/50">{apiKeyDetected ? "(detected)" : "(not detected)"}</span>
            )}
          </CardTitle>
        </CardHeader>
        {extensionDetected ? (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(setOpenaiSettings)} className="grid gap-8">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 gap-y-10">
                      <FormControl>
                        <Input
                          disabled={apiKeyDetected}
                          variant={apiKeyDetected ? "valid" : "default"}
                          placeholder={apiKeyDetected ? "OpenAI API key detected" : "Insert your OpenAI API key"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="destructive" onClick={() => remove()} disabled={!apiKeyDetected}>
                    Clear key
                  </Button>
                  <Button variant="outline" type="submit" disabled={apiKeyDetected}>
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        ) : (
          <>
            <CardContent>
              <div className="text-xl font-semibold text-muted-foreground">Available only in extension</div>
              <div className="text-sm text-muted-foreground">Manage your API key using the extension popup</div>
            </CardContent>
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-muted-foreground">{account && account.name}</div>
          <div className="text-sm text-muted-foreground">Email: {account && account.email}</div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    By clicking <span className="font-semibold">Yes, delete my account</span> you hereby cancel your
                    subscription and forfeit all your remaining recommendations. These changes will take immediate
                    effect and are irreversible. If you wish to keep your account active use the{" "}
                    <span className="font-semibold">Keep my account active</span> button below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="justify-between">
                  <AlertDialogCancel>Keep my account active</AlertDialogCancel>
                  {/* <AlertDialogAction> */}
                  <Button
                    variant="destructive"
                    disabled={loading}
                    onClick={() => handleDelete()}
                    className="whitespace-nowrap"
                  >
                    Yes, delete my account
                  </Button>
                  {/* </AlertDialogAction> */}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>

          <Button variant="outline" onClick={() => signOut()} disabled={!account}>
            Log out
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-primary text-muted">
        <CardHeader>
          <CardTitle>Upgrade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">Enhance your plan for more recommendations</div>
        </CardContent>
        <CardFooter className="grid grid-cols-1">
          {!!profile.stripePriceId ? (
            <Button variant="secondary" onClick={() => handleSubscribe(profile.stripePriceId)}>
              Upgrade
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <a href={`${appwriteUrl}/#pricing`} target="_blank">
                Check available plans
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </section>
  );
}
