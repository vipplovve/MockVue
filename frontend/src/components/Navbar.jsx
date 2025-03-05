import { Github } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar2 = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-950 bg-opacity-90 backdrop-blur-sm px-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" className="h-14 w-14" />

            <span className="text-3xl font-bold text-white">Mock<span className="text-blue-700">Vue</span></span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="https://github.com/Samar-28/MockVue"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 hover:bg-stone-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Github size={28} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;