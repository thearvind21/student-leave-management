
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-auto border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} Leave Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
