import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="relative w-48 h-16 mb-8">
        <Image src="/Logo/PNG/Asset 20.png" alt="Netacuv" fill className="object-contain" />
      </div>
      
      <h1 className="text-6xl font-black text-slate-800 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 mb-6">Page introuvable</h2>
      
      <p className="text-slate-500 max-w-md mb-8">
        Oups ! La page que vous recherchez semble avoir disparu ou n'a jamais existé.
      </p>
      
      <Link 
        href="/" 
        className="px-8 py-3 rounded-xl font-bold text-white bg-[#1e8ae9] hover:bg-[#166dbb] shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
}
