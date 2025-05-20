
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-fi-blue text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="font-medium text-lg mb-4">FI Emissions GmbH</h4>
            <p className="text-white/70 text-sm mb-4">
              Ihre verlässliche Finanzplattform für maßgeschneiderte Anlagelösungen.
            </p>
            <div className="flex items-center space-x-2">
              <span className="block w-2 h-2 rounded-full bg-fi-gold"></span>
              <span className="text-sm text-white/70">Seit 2023</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/impressum"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link 
                  to="/datenschutz"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-white/70 hover:text-white transition-colors duration-200">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Kontakt</h4>
            <ul className="space-y-2">
              <li className="text-white/70">
                secretary@fi.group
              </li>
              <li className="text-white/70">
                +49 40 696 384 155
              </li>
              <li className="text-white/70">
                Ballindamm 27, 20095 Hamburg
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <p className="text-sm text-center text-white/70">© 2023 FI Emissions GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
