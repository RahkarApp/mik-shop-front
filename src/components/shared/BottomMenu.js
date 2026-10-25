
import Link from "next/link";
import { Home, List, ShoppingCart, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomMenu({ onOpenCategoryModal, onOpenSearchModal, onOpenFilterModal, activeModal }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl z-[60] md:hidden flex justify-between items-center px-4 py-2" style={{height: '60px'}}>
      <Link href="/" className="flex flex-col items-center hover:text-primary" prefetch={false}>
        <Home className={`w-6 h-6 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/' ? 'text-primary' : 'text-gray-700'}`} />
        <span className={`text-xs mt-1 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/' ? 'text-primary' : 'text-gray-700'}`}>خانه</span>
      </Link>
      <button
        type="button"
        className="flex flex-col items-center focus:outline-none"
        onClick={onOpenCategoryModal}
      >
        <List className="w-6 h-6 text-gray-700" />
        <span className="text-xs mt-1 text-gray-700">دسته‌بندی</span>
      </button>
      <Link href="/cart" className="flex flex-col items-center hover:text-primary" prefetch={false}>
        <ShoppingCart className={`w-6 h-6 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/cart' ? 'text-primary' : 'text-gray-700'}`} />
        <span className={`text-xs mt-1 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/cart' ? 'text-primary' : 'text-gray-700'}`}>سبد خرید</span>
      </Link>
      <button
        type="button"
        className="flex flex-col items-center focus:outline-none"
        onClick={onOpenSearchModal}
      >
        <Search className="w-6 h-6 text-gray-700" />
        <span className="text-xs mt-1 text-gray-700">جستجو</span>
      </button>
      <Link href="/profile" className="flex flex-col items-center hover:text-primary" prefetch={false}>
        <User className={`w-6 h-6 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/profile' ? 'text-primary' : 'text-gray-700'}`} />
        <span className={`text-xs mt-1 ${['/', '/cart', '/profile'].includes(pathname) && pathname === '/profile' ? 'text-primary' : 'text-gray-700'}`}>پروفایل</span>
      </Link>
    </nav>
  );
}
