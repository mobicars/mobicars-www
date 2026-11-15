import { Toaster } from "@/components/ui/toaster";
import { clientMessages } from "@/i18n/client-messages";
import { isLang } from "@/i18n/config";
import { MessagesProvider } from "@/i18n/messages-context";

/**
 * Toasts are used only in the booking flow (sharing a booking, sending the
 * customer step), so their library loads here and not on every page. The
 * booking steps' texts are added here too, on top of the `[lang]` layout's
 * (`CLIENT_MESSAGE_SCOPES.reservation`).
 */
export default async function ReservationLayout({ children, params }: LayoutProps<"/[lang]/reservation">) {
  const { lang } = await params;
  return (
    <MessagesProvider messages={clientMessages(isLang(lang) ? lang : "pl", "reservation")}>
      {children}
      <Toaster />
    </MessagesProvider>
  );
}
