import type en from "./locales/en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      [K in keyof typeof en]: (typeof en)[K];
    };
  }
}
