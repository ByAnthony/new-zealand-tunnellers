import enMessages from "../messages/en.json";
import frMessages from "../messages/fr.json";

const MESSAGE_BY_LOCALE = {
  en: enMessages,
  fr: frMessages,
} as const;

export function getMessageFromMessages(
  locale: keyof typeof MESSAGE_BY_LOCALE,
  namespace: string,
  key: string,
  values?: Record<string, unknown>,
) {
  const messages = MESSAGE_BY_LOCALE[locale];
  const resolved = [namespace, ...key.split(".")].reduce<unknown>(
    (current, segment) =>
      current && typeof current === "object"
        ? (current as Record<string, unknown>)[segment]
        : undefined,
    messages,
  );

  if (typeof resolved !== "string") return key;
  if (!values) return resolved;

  return resolved.replace(/\{(\w+)\}/g, (_match, token: string) =>
    String(values[token] ?? `{${token}}`),
  );
}

export function makeMessagesTranslator(locale: keyof typeof MESSAGE_BY_LOCALE) {
  return (namespace: string) =>
    (key: string, values?: Record<string, unknown>) =>
      getMessageFromMessages(locale, namespace, key, values);
}
