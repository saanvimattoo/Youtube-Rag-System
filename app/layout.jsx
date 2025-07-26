import Provider from '@/components/Provider';
import '@/assets/styles/globals.css';

export const metadata = {
  title: 'RewindAI',
  description: 'Ask questions and get answers from any YouTube video.',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white">
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
