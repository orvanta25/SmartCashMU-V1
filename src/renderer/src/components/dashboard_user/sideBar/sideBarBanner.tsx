import logo from '../../../assets/AdMobile1.gif';

export function SidebarBanner() {
  return (
    <div className="w-full relative overflow-hidden bg-transparent mt-4 h-32">
      <img
        src={logo}   // ✅ utiliser l'import
        alt="logo"
        className="w-full h-full object-cover rounded-lg"
        style={{ maxWidth: '320px' }}
      />
    </div>
  );
}
