import "./globals.css";

export const metadata = {
  title: "离婚力量表网页端",
  description: "离婚力量表网页端项目",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}