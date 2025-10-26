"use client";

import { NextIntlClientProvider } from "next-intl";
import { GroupProvider } from "../../contexts/GroupContext";
import { ChatProvider } from "../../contexts/ChatContext";
import LayoutWrapper from "../../components/LayoutWrapper";

interface ClientProvidersProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export default function ClientProviders({
  children,
  messages,
  locale,
}: ClientProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <GroupProvider>
        <ChatProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ChatProvider>
      </GroupProvider>
    </NextIntlClientProvider>
  );
}
