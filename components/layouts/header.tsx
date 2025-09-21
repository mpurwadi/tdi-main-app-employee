'use client';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import IconMenu from '@/components/icon/icon-menu';

const Header = () => {
    const dispatch = useDispatch();
    
    const toggleSidebarHandler = () => {
        dispatch(toggleSidebar());
    };

    return (
        <header className="z-40">
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-mr-1 rtl:-ml-1 hidden md:inline" src="/logo.png" alt="logo" />
                            <span className="hidden text-2xl font-semibold text-primary ltr:ml-1.5 rtl:mr-1.5 md:inline">TDI Service</span>
                        </Link>
                    </div>

                    {/* hamburger menu icon */}
                    <div className="flex h-16 w-16 items-center justify-center transition-all hover:bg-gray-100/30 ltr:mr-2 rtl:ml-2 lg:hidden">
                        <button
                            type="button"
                            className="collapse-icon inline-flex h-16 w-16 items-center justify-center transition-all hover:bg-gray-100/30 ltr:mr-2 rtl:ml-2"
                            onClick={toggleSidebarHandler}
                        >
                            <IconMenu className="text-black dark:text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;