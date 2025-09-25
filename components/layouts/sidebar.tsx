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
    const [userRoles, setUserRoles] = useState<string[]>([]);
    
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    
    const toggleSidebarHandler = () => {
        dispatch(toggleSidebar());
    };
    
    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
    
    // Function to handle ITSM menu item selection - now using direct routing
    const handleITSMMenuItemClick = (menuItem: string) => {
        setActiveMenuItem(menuItem);
        handleMenuItemClick();
        // No longer dispatching custom events as we're using direct routing
    };
    
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
                        // Expand the parent menu if it's the attendance management menu
                        const button = parentLi.querySelector('button');
                        if (button && button.textContent?.includes('Attendance')) {
                            setCurrentMenu('attendanceManagement');
                        }
                        parentUl = parentLi.parentElement;
                    } else {
                        break;
                    }
                }
            }
        }
        
        // Special case: if we're on the attendance report page, make sure the attendance management menu is expanded
        if (window.location.pathname === '/admin/reports/attendance') {
            setCurrentMenu('attendanceManagement');
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
    
    // Get user role and roles
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role);
                    setUserRoles(userData.roles || []);
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
                                            <button 
                                                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                                                title="Sign Out"
                                                onClick={async () => {
                                                    try {
                                                        await fetch('/api/auth/logout', {
                                                            method: 'POST',
                                                            credentials: 'include'
                                                        });
                                                        window.location.href = '/auth/boxed-signin';
                                                    } catch (error) {
                                                        console.error('Logout error:', error);
                                                        window.location.href = '/auth/boxed-signin';
                                                    }
                                                }}
                                            >
                                                <IconLogout className="w-5 h-5 mb-1" />
                                                <span className="text-xs">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        <div className="menu-items h-[calc(100vh-140px)] overflow-y-auto">
                            <ul className="relative space-y-1 py-4 font-semibold">
                                {/* ADMIN SECTION - Only show for admin/superadmin users */}
                                {(userRole === 'admin' || userRole === 'superadmin') && (
                                    <>
                                        <h2 className="py-3 px-6 text-xs font-bold uppercase text-black/70 dark:text-white/70 bg-white-light/30 dark:bg-dark/60 rounded-lg mx-2">
                                            <IconMinus className="hidden h-5 w-4 flex-none" />
                                            <span>Admin</span>
                                        </h2>
                                        
                                        {/* Admin Dashboard */}
                                <li className="menu-item">
                                    <Link 
                                        href="/admin/dashboard"
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
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
                                                className={`w-full flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
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
                                                <ul className="sub-menu mt-2 space-y-1 px-2 mx-2">
                                                    <li>
                                                        <Link
                                                            href="/admin/users"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/users' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">All Users</span>
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
                                                            <span className="text-sm">Approve Users</span>
                                                        </Link>
                                                    </li>
                                                    {/* Moved My Profile under User Management */}
                                                    <li>
                                                        <Link
                                                            href="/users/profile"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/users/profile' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">My Profile</span>
                                                        </Link>
                                                    </li>

                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        
                                        {/* Attendance Management */}
                                        <li className="menu-item">
                                            <button
                                                type="button"
                                                className={`w-full flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    isActive('attendanceManagement') 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={() => { toggleMenu('attendanceManagement'); handleMenuItemClick(); }}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Attendance</span>
                                                <div className="rtl:rotate-180 ml-auto transition-all duration-300">
                                                    <IconCaretDown
                                                        className={`h-5 w-5 transition-transform duration-300 ${
                                                            isActive('attendanceManagement') ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </div>
                                            </button>
                                            
                                            <AnimateHeight
                                                duration={300}
                                                height={isActive('attendanceManagement') ? 'auto' : 0}
                                                animateOpacity={true}
                                            >
                                                <ul className="sub-menu mt-2 space-y-1 px-2 mx-2">
                                                    <li>
                                                        <Link
                                                            href="/apps/absen"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/apps/absen' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">Absence</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/reports/attendance"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/reports/attendance' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                            onClick={() => { setCurrentMenu('attendanceManagement'); handleMenuItemClick(); }}
                                                        >
                                                            <span className="text-sm">Report</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/logbook"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/logbook' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">Logbook</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/apps/logbook"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/apps/logbook' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">My Log Book</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/remote-schedule"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/remote-schedule' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">Remote Schedule</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/holidays"
                                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                                                pathname === '/admin/holidays' 
                                                                    ? 'bg-primary/10 text-primary' 
                                                                    : 'hover:bg-primary/10 hover:text-primary'
                                                            }`}
                                                        >
                                                            <span className="text-sm">Holidays</span>
                                                        </Link>
                                                    </li>
                                                    </ul>
                                            </AnimateHeight>
                                        </li>
                                        
                                        {/* Approve Logbook */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/logbook"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/admin/logbook' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Approve Logbook</span>
                                            </Link>
                                        </li>
                                        
                                        {/* News & Announcements */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/admin/news"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/admin/news' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">News & Announcements</span>
                                            </Link>
                                        </li>
                                        
                                        {/* ITSM Service */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/itsm"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/itsm' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-base">ITSM Service</span>
                                            </Link>
                                        </li>
                                        

                                    </>
                                )}
                                
                                {/* Regular User Section */}
                                {(userRole === 'user' || userRoles.includes('service_requester') || userRoles.includes('service_provider') || !userRole) && (
                                    <>
                                        <h2 className="py-3 px-6 text-xs font-bold uppercase text-black/70 dark:text-white/70 bg-white-light/30 dark:bg-dark/60 rounded-lg mx-2">
                                            <IconMinus className="hidden h-5 w-4 flex-none" />
                                            <span>My Services</span>
                                        </h2>
                                        
                                        {/* User Dashboard */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/user/dashboard"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/user/dashboard' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuDashboard className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Dashboard</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Absence */}
                                        <li className="menu-item">
                                            <Link
                                                href="/apps/absen"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/apps/absen' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Absence</span>
                                            </Link>
                                        </li>
                                        
                                        {/* Remote Login */}
                                        <li className="menu-item">
                                            <Link
                                                href="/apps/remote"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/apps/remote' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuUsers className="h-5 w-5 shrink-0" />
                                                <span className="text-base">Remote Login</span>
                                            </Link>
                                        </li>
                                        
                                        {/* My Log Book */}
                                        <li className="menu-item">
                                            <Link
                                                href="/apps/logbook"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/apps/logbook' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <IconMenuCalendar className="h-5 w-5 shrink-0" />
                                                <span className="text-base">My Log Book</span>
                                            </Link>
                                        </li>
                                        
                                        {/* ITSM Service */}
                                        <li className="menu-item">
                                            <Link 
                                                href="/itsm"
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 mx-2 ${
                                                    pathname === '/itsm' 
                                                        ? 'bg-primary text-white shadow-[0_7px_14px_0_rgb(100_100_100_/_20%)]' 
                                                        : 'hover:bg-primary/10 hover:text-primary'
                                                }`}
                                                onClick={handleMenuItemClick}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-base">ITSM Service</span>
                                            </Link>
                                        </li>
                                    </>
                                )}
                                
                                
                            </ul>
                        </div>
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    );
};

export default Sidebar;