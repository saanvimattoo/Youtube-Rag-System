import '@/assets/styles/globals.css';

export const metadata = {
  title: 'YouTube Video Q&A',
  description: 'Ask questions and get answers from any YouTube video.',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
