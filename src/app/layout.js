import "./globals.css";

export const metadata = {
  title: "Oasis Status",
  description: "Live status for youroasis.gr",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
