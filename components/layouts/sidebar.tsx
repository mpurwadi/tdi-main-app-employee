'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import IconInfoCircle from '@/components/icon/icon-info-circle';
import IconLogout from '@/components/icon/icon-logout';
import Dropdown from '@/components/dropdown';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Failed to fetch user role:', error);
            }
        };

        fetchUserRole();
    }, []);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/logo.png" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">TDI Employee</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {/* ADMIN SECTION */}
                            {(userRole === 'admin' || userRole === 'superadmin') && (
                                <>
                                    <h2 className="hidden -mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                        <IconMinus className="hidden h-5 w-4 flex-none" />
                                        <span>{t('Admin')}</span>
                                    </h2>
                                    
                                    {/* Admin Dashboard */}
                                    <li className="nav-item">
                                        <Link href="/admin/dashboard" className="group">
                                            <div className="flex items-center">
                                                <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    {t('Dashboard')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                    
                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'userManagement' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('userManagement')}>
                                            <div className="flex items-center">
                                                <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('User Management')}</span>
                                            </div>
                                            <div className={currentMenu !== 'userManagement' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'userManagement' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/admin/users">{t('All Users')}</Link>
                                                </li>
                                                <li>
                                                    <Link href="/admin/approval">{t('Approve Users')}</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>
                                    
                                    <li className="nav-item">
                                        <Link href="/admin/logbook" className="group">
                                            <div className="flex items-center">
                                                <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    {t('Approve Logbook')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                    {/* Admin QR Code Generation */}
                                    <li className="nav-item">
                                        <Link href="/admin/qr-code" className="group">
                                            <div className="flex items-center">
                                                <IconMenuDashboard className="shrink-0 group-hover:!text-primary" /> {/* Using a generic icon for now */}
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    {t('Generate QR Code')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                    
                                    {/* News & Announcements Management */}
                                    <li className="nav-item">
                                        <Link href="/admin/news" className="group">
                                            <div className="flex items-center">
                                                <IconMenuNotes className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    {t('News & Announcements')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                    
                                    {/* Remote Schedule Management */}
                                    <li className="nav-item">
                                        <Link href="/admin/remote-schedule" className="group">
                                            <div className="flex items-center">
                                                <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    Remote Schedule
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                    
                                    {/* Roles Management - Only visible to superadmins */}
                                    {userRole === 'superadmin' && (
                                        <li className="nav-item">
                                            <Link href="/admin/roles" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                        {t('Roles Management')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    )}
                                    
                                    {/* Attendance Report */}
                                    <li className="nav-item">
                                        <Link href="/admin/reports/attendance" className="group">
                                            <div className="flex items-center">
                                                <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                                    {t('Attendance Report')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                </>
                            )}

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>{t('User Profile')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('users')}>
                                    <div className="flex items-center">
                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('users')}</span>
                                    </div>

                                    <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/users/profile">{t('profile')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="nav-item">
                                <Link href="/apps/logbook" className="group">
                                    <div className="flex items-center">
                                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            {t('Logbook')}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/apps/absen" className="group">
                                    <div className="flex items-center">
                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            Absence
                                        </span>
                                    </div>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/apps/remote" className="group">
                                    <div className="flex items-center">
                                        <IconMenuCalendar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            {t('Remote Check-in')}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                            
                            {/* Quick Access Section */}
                            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Quick Access</h2>
                                <div className="grid grid-cols-3 gap-2 px-4 py-2">
                                    <Link 
                                        href="/apps/calendar" 
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Calendar"
                                    >
                                        <IconMenuCalendar className="w-5 h-5 mb-1" />
                                        <span className="text-xs">Calendar</span>
                                    </Link>
                                    <Link 
                                        href="/apps/todolist" 
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Todo List"
                                    >
                                        <IconMenuTodo className="w-5 h-5 mb-1" />
                                        <span className="text-xs">Todo</span>
                                    </Link>
                                    <Link 
                                        href="/auth/boxed-signin" 
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Sign Out"
                                    >
                                        <IconLogout className="w-5 h-5 mb-1" />
                                        <span className="text-xs">Sign Out</span>
                                    </Link>
                                </div>
                            </div>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
