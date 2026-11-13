// A second root layout, only for `/`: it has no locale, and a static export has
// no proxy to pick one, so the home page just sends the visitor to the default
// locale. The real root layout is `app/[lng]/layout.tsx`.
export default function RedirectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
