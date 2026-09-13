import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Loom Commerce',
  description: 'Modern shopping experience built with Next.js and React',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
