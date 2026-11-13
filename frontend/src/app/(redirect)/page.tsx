import { env } from "@/env";
import { defaultLocale } from "@/lib/locale";

// `redirect()` would only redirect through client JavaScript in a static
// export, so this page redirects with plain HTML: a meta refresh (works with
// JavaScript off, and is what GitHub Pages serves) plus a link as a fallback.
export default function Index() {
  const target = `${env.NEXT_PUBLIC_BASE_PATH}/${defaultLocale}/`;

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <link rel="canonical" href={target} />
      <a href={target}>{defaultLocale}</a>
    </>
  );
}
