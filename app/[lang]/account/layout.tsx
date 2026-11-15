import { clientMessages } from "@/i18n/client-messages";
import { isLang } from "@/i18n/config";
import { MessagesProvider } from "@/i18n/messages-context";

/**
 * The panel's and the sign-in forms' texts, on top of the `[lang]` layout's
 * (`CLIENT_MESSAGE_SCOPES.account`).
 */
export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/account">) {
  const { lang } = await params;
  return <MessagesProvider messages={clientMessages(isLang(lang) ? lang : "pl", "account")}>{children}</MessagesProvider>;
}
