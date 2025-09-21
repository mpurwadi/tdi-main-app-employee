'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenu from '@/components/icon/icon-menu';
import IconMessage from '@/components/icon/icon-message';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconLogout from '@/components/icon/icon-logout';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';

const Sidebar = () => {
    const dispatch = useDispatch();
    
    // Add enhanced error handling for the translation
    let t;
    try {
        const translationResult = getTranslation();
        t = translationResult.t;
        
        // Ensure t is actually a function
        if (typeof t !== 'function') {
            t = (key: string) => key;
        }
    } catch (e) {
        // Fallback if getTranslation fails
        t = (key: string) => key;
    }
    
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    
    const toggleSidebarHandler = () => {
        dispatch(toggleSidebar());
    };
    
    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
    
    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.querySelector('.sidebar');
            const hamburgerMenu = document.querySelector('.collapse-icon');
            
            if (sidebar && !sidebar.contains(event.target as Node) && hamburgerMenu && !hamburgerMenu.contains(event.target as Node)) {
                if (window.innerWidth <= 1024 && themeConfig.sidebar) {
                    dispatch(toggleSidebar());
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [themeConfig.sidebar, dispatch]);
    
    // Close sidebar when clicking on menu items on mobile
    const handleMenuItemClick = () => {
        if (window.innerWidth <= 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    };
    
    // Set active menu based on current path
    useEffect(() => {
        const selector = document.querySelector('ul.vertical-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.vertical-menu a.active');
            for (let i = 0; i < all.length; i++) {
                all[i].classList.remove('active');
            }
            
            let closestLi = selector.closest('li');
            if (closestLi) {
                closestLi.classList.add('active');
                
                let parentUl = closestLi.parentElement;
                while (parentUl && parentUl.tagName === 'UL') {
                    let parentLi = parentUl.closest('li');
                    if (parentLi) {
                        parentLi.classList.add('active');
                        parentUl = parentLi.parentElement;
                    } else {
                        break;
                    }
                }
            }
        }
    }, [pathname]);
    
    // Toggle menu
    const toggleMenu = (name: string) => {
        if (currentMenu === name) {
            setCurrentMenu('');
        } else {
            setCurrentMenu(name);
        }
    };
    
    // Check if menu item is active
    const isActive = (item: string) => {
        return currentMenu === item;
    };
    
    // Get user role
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role);
                }
            } catch (error) {
                console.error('Failed to fetch user role:', error);
            }
        };
        
        fetchUserRole();
    }, []);
    
    // Check if submenu has error
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setErrorSubMenu(true);
        } else {
            setErrorSubMenu(false);
        }
        
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setErrorSubMenu(true);
            } else {
                setErrorSubMenu(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return (
        <div className={`sidebar ${themeConfig.sidebar ? 'ltr:left-0 rtl:right-0' : 'ltr:-left-[260px] rtl:-right-[260px]'} lg:ltr:left-0 lg:rtl:right-0 z-50`} data-testid="sidebar">
            <div className="sidebar-wrapper h-full">
                <PerfectScrollbar className="relative !h-screen">
                    <div className="icon-menu">
                        <button
                            type="button"
                            className="collapse-icon flex h-16 w-16 items-center justify-center transition-all hover:bg-gray-100/30 ltr:mr-2 rtl:ml-2 dark:hover:bg-dark/20 lg:hidden"
                            onClick={toggleSidebarHandler}
                        >
                            <IconMenu className="text-black dark:text-white" />
                        </button>
                    </div>
                    <div className="main-menu h-full">
                        <div className="logo-box">
                            <Link href="/" className="main-logo flex shrink-0 items-center">
                                <img className="inline w-10 ltr:-mr-1 rtl:-ml-1 hidden md:inline" src="/logo.png" alt="logo" />
                                <span className="hidden text-2xl font-semibold text-primary ltr:ml-1.5 rtl:mr-1.5 md:inline">TDI Service</span>
                            </Link>
                        </div>
                        {/* Quick Access Section - Fixed at the top */}
                                <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
                                    <div className="pb-4">
                                        <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Quick Access</h2>
                                        <div className="grid grid-cols-4 gap-2 px-4 py-2">
                                            <Link 
                                                href="/apps/calendar" 
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                title="Calendar"
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuCalendar className="w-5 h-5 mb-1" />
                                                <span className="text-xs">Calendar</span>
                                            </Link>
                                            <Link 
                                                href="/apps/todolist" 
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                title="Todo List"
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuCalendar className="w-5 h-5 mb-1" />
                                                <span className="text-xs">Todo</span>
                                            </Link>
                                            <Link 
                                                href="/users/profile" 
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                title="Profile"
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuUsers className="w-5 h-5 mb-1" />
                                                <span className="text-xs">Profile</span>
                                            </Link>
                                            <Link 
                                                href="/auth/boxed-signin" 
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                title="Sign Out"
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconLogout className="w-5 h-5 mb-1" />
                                                <span className="text-xs">Sign Out</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                        <div className="menu-items h-[calc(100vh-140px)] overflow-y-auto">
                            <ul className="relative space-y-0.5 py-4 font-semibold">
                                {/* ADMIN SECTION - Only show for admin/superadmin users */}
                                {(userRole === 'admin' || userRole === 'superadmin') && (
                                    <>
                                        <h2 className="py-3 px-7 text-xs font-bold uppercase text-black/70 dark:text-white/70 -mx-4 bg-white-light/30 dark:bg-dark/60">
                                            <IconMinus className="hidden h-5 w-4 flex-none" />
                                            <span>Admin</span>
                                        </h2>
                                        
                                        {/* Admin Dashboard */}
                                <li className="menu-item">
                                    <Link 
                                        href="/admin/dashboard"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/admin/dashboard' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                        onClick={handleMenuItemClick}
                                    >
                                        <IconMenuDashboard className="h-5 w-5 shrink-0" />
                                        <span className="text-base">Dashboard</span>
                                    </Link>
                                </li>
                                        
                                        {/* User Management */}
                                        <li className="menu-item">
                                            <button
                                                type="button"
                                                className={`w-full flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    isActive('userManagement') 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={() => { toggleMenu('userManagement'); handleMenuItemClick(); }}
                                            >
                                                <IconMenuUsers className="h-5 w-5 shrink-0" />
                                                <span className="text-base">User Management</span>
                                                <div className="rtl:rotate-180 ml-auto transition-all duration-300">
                                                    <IconCaretDown
                                                        className={`h-5 w-5 transition-transform duration-300 ${
                                                            isActive('userManagement') ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </div>
                                            </button>
                                            
                                            <AnimateHeight
                                                duration={300}
                                                height={isActive('userManagement') ? 'auto' : 0}
                                                animateOpacity={true}
                                            >
                                                <ul className="sub-menu mt-2 space-y-1 px-4">
                                                    <li>
                                                        <Link
                                                            href="/admin/users"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/users' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <IconMinus className="h-5 w-5 shrink-0" />
                                                            <span className="text-base">All Users</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/approval"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/approval' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <IconMinus className="h-5 w-5 shrink-0" />
                                                            <span className="text-base">Approve Users</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        
                                        {/* Approve Logbook */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/logbook"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/logbook' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Approve Logbook</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Generate QR Code */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/qr-code"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/qr-code' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuDashboard className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Generate QR Code</span>
                                            </Link>
                                        </li>
                                        
                                        {/* News & Announcements */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/news"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/news' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">News & Announcements</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Remote Schedule Management */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/remote-schedule"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/remote-schedule' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Remote Schedule</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Tickets Management */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/tickets"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/tickets' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMessage className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Tickets</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Holidays Management */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/holidays"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                    pathname === '/admin/holidays' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Holidays</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Roles Management - Only visible to superadmins */}
                                        {userRole === 'superadmin' && (
                                            <li className="menu-item">
                                                <Link 
                                                    href="/admin/roles"
                                                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                                        pathname === '/admin/roles' 
                                                            ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                            : 'hover:bg-primary/10 hover:text-primary'
                                                    }`}
                                                >
                                                    <IconMenuUsers className="h-5 w-5 shrink-0" />
                                                    <span className="text-base">Roles Management</span>
                                                </Link>
                                            </li>
                                        )}
                                    </>
                                )}
                                
                                {/* User Dashboard - For all authenticated users */}
                                <li className="menu-item">
                                    <Link
                                        href="/user-dashboard"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/user-dashboard' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                        onClick={handleMenuItemClick}
                                    >
                                        <IconMenuDashboard className="h-5 w-5 shrink-0" />
                                        <span className="text-base">Dashboard</span>
                                    </Link>
                                </li>
                                
                                {/* Logbook - For regular users */}
                                <li className="menu-item">
                                    <Link
                                        href="/apps/logbook"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/apps/logbook' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                        <span className="text-base">My Logbook</span>
                                    </Link>
                                </li>
                                
                                {/* Remote Work - For regular users */}
                                <li className="menu-item">
                                    <Link
                                        href="/apps/remote"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/apps/remote' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                        <span className="text-base">Remote Work</span>
                                    </Link>
                                </li>
                                
                                {/* Attendance - For regular users */}
                                <li className="menu-item">
                                    <Link
                                        href="/apps/absen"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/apps/absen' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                        <span className="text-base">Attendance</span>
                                    </Link>
                                </li>
                                
                                {/* Profile Management */}
                                <li className="menu-item">
                                    <Link
                                        href="/users/profile"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/users/profile' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <IconMenuUsers className="h-5 w-5 shrink-0" />
                                        <span className="text-base">My Profile</span>
                                    </Link>
                                </li>
                                
                                {/* Tickets - For regular users */}
                                <li className="menu-item">
                                    <Link
                                        href="/tickets"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                                            pathname === '/tickets' 
                                                ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <IconMessage className="h-5 w-5 shrink-0" />
                                        <span className="text-base">My Tickets</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    );
};

export default Sidebar;