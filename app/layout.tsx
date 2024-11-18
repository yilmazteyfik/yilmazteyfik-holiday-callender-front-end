import './globals.css';
import Navbar from  './components/Navbar'
export const metadata = {
  title: 'Tatil Takvimi',
  description: 'Ülke ve bölge bazında tatil tarihlerini görüntüleyin.',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="tr">
      <body>
      <Navbar/>
      <main>{children}</main>
      </body>
      </html>
  );
}
