import Sidebar from '@/components/Sidebar';
import GradientBackground from '@/components/GradientBackground';

const DashboardLayout = ({ children }) => {
  return (
    <div className="relative flex h-screen bg-black text-white overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 flex w-full">
            <Sidebar />
            <main className="flex-1 flex flex-col bg-black/30 backdrop-blur-xl">
                {children}
            </main>
        </div>
    </div>
  );
};

export default DashboardLayout;
