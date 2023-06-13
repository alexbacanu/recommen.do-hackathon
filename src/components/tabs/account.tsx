"use client";

import type { OpenAISettings } from "~/lib/types";
import type { Models } from "appwrite";

import { zodResolver } from "@hookform/resolvers/zod";
import { useStorage } from "@plasmohq/storage/hook";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useAppwrite } from "~/lib/helpers/useAppwrite";
import { openAiSchema } from "~/lib/schema";

interface AccountProps {
  account: Models.User<Models.Preferences>;
  profile: Models.Document;
}

export function Account({ account, profile }: AccountProps) {
  const { signOut } = useAppwrite();
  const { createJWT } = useAppwrite();

  const [openaiSettings, setOpenaiSettings, { remove }] = useStorage<OpenAISettings>("openaiSettings", {
    apiKey: undefined,
    orgName: undefined,
  });

  const apiKeyDetected = !!openaiSettings?.apiKey;

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

    console.log("jwt:", jwt);

    const getCheckoutURL = await fetch(`/api/stripe/subscription/${priceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const checkoutUrl = await getCheckoutURL.json();

    console.log("getCheckoutURL:", checkoutUrl);
    window.open(checkoutUrl.url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="account" className="grid grid-cols-1 gap-x-4 gap-y-6 lg:grid-cols-3 lg:gap-x-8">
      {/* <Card>
        <CardHeader>
          <CardTitle className="">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-muted-foreground">{profile ? profile.credits : 0}</div>
          <div className="text-sm text-muted-foreground">Recommendations remaining</div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Only successful recommendations are processed</CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-muted-foreground">
            {hasSubscription ? profile.stripeSubscriptionName : "Free"}
          </div>
          <div className="text-sm text-muted-foreground">
            {hasSubscription
              ? `Renew date: ${new Date(profile.stripeCurrentPeriodEnd).toUTCString()}`
              : "No subscription"}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Will automatically renew every month</CardFooter>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>
            API key <span className="text-muted-foreground/50">(not detected)</span>
          </CardTitle>
        </CardHeader>
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
                        placeholder={apiKeyDetected ? "API key detected" : "API key"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input disabled placeholder="Organization name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="destructive" onClick={() => remove()}>
                  Clear key
                </Button>
                <Button variant="outline" type="submit" disabled={apiKeyDetected}>
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold text-muted-foreground">{account && account.name}</div>
          <div className="text-sm text-muted-foreground">Owner: {account && account.email}</div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button variant="destructive" disabled={true} className="whitespace-nowrap">
            Delete<span className="pl-2 text-xs">Soon™</span>
          </Button>
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
          <Button variant="secondary" onClick={() => handleSubscribe(profile.stripePriceId)}>
            Upgrade
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
