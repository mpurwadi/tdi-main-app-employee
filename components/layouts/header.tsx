'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { IRootState } from '@/store';
import { toggleTheme, toggleSidebar, toggleRTL } from '@/store/themeConfigSlice';
import Dropdown from '@/components/dropdown';
import IconMenu from '@/components/icon/icon-menu';
import IconChatNotification from '@/components/icon/icon-chat-notification';
import IconSearch from '@/components/icon/icon-search';
import IconXCircle from '@/components/icon/icon-x-circle';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';
import IconMailDot from '@/components/icon/icon-mail-dot';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconInfoCircle from '@/components/icon/icon-info-circle';
import IconUser from '@/components/icon/icon-user';
import IconMail from '@/components/icon/icon-mail';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconLogout from '@/components/icon/icon-logout';
import IconSettings from '@/components/icon/icon-settings';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMenuApps from '@/components/icon/menu/icon-menu-apps';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuMore from '@/components/icon/menu/icon-menu-more';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import { usePathname, useRouter } from 'next/navigation';
import { getTranslation } from '@/i18n';
import { fetchNotifications, markNotificationAsRead } from '@/services/notificationService';

const Header = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    
    // Add enhanced error handling for the translation
    let t, i18n;
    try {
        const translationResult = getTranslation();
        t = translationResult.t;
        i18n = translationResult.i18n;
        
        // Ensure t is actually a function
        if (typeof t !== 'function') {
            t = (key: string) => key;
        }
        
        // Ensure i18n is properly structured
        if (!i18n || typeof i18n !== 'object') {
            i18n = {
                language: 'en',
                changeLanguage: () => {}
            };
        }
    } catch (e) {
        // Comprehensive fallback if getTranslation fails
        t = (key: string) => key;
        i18n = {
            language: 'en',
            changeLanguage: () => {}
        };
    }

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState<string | null>(null);

    // Fetch notifications
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setIsNotificationsLoading(true);
                // Use a mock userId for now, or get it from user context/state
                const userId = 1; // Replace with actual user ID
                const notificationsData = await fetchNotifications(userId);
                
                if (notificationsData && Array.isArray(notificationsData)) {
                    setNotifications(notificationsData);
                    setUnreadCount(notificationsData.filter((n: any) => !n.read).length);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setNotificationsError('Failed to load notifications');
            } finally {
                setIsNotificationsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const toggleThemeHandler = (value: string) => {
        dispatch(toggleTheme(value));
    };

    const toggleSidebarHandler = () => {
        dispatch(toggleSidebar());
    };

    const toggleRtlHandler = (value: string) => {
        dispatch(toggleRTL(value));
    };

    const handleNotificationClick = async (notificationId: string) => {
        try {
            await markNotificationAsRead(parseInt(notificationId, 10));
            
            // Update local state
            setNotifications(prev => 
                prev.map(n => 
                    n.id === parseInt(notificationId, 10) ? { ...n, read: true } : n
                )
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? '' : 'dark'}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-mr-1 rtl:-ml-1 hidden md:inline" src="/logo.png" alt="logo" />
                            <span className="hidden text-2xl font-semibold text-primary ltr:ml-1.5 rtl:mr-1.5 md:inline">TDI Employee</span>
                        </Link>
                    </div>

                    {/* hamburger menu icon */}
                    <div className="flex h-16 w-16 items-center justify-center transition-all hover:bg-gray-100/30 ltr:mr-2 rtl:ml-2 dark:hover:bg-gray-900/20 lg:hidden">
                        <button
                            type="button"
                            className="collapse-icon inline-flex h-16 w-16 items-center justify-center transition-all hover:bg-gray-100/30 ltr:mr-2 rtl:ml-2 dark:hover:bg-black/20"
                            onClick={toggleSidebarHandler}
                        >
                            <IconMenu className="text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Quick Access Menu */}
                    <div className="flex items-center space-x-4 ml-4">
                        <Link href="/apps/calendar" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <IconMenuCalendar className="w-5 h-5 mb-1" />
                            <span className="text-xs">Calendar</span>
                        </Link>
                        <Link href="/apps/todolist" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <IconMenuTodo className="w-5 h-5 mb-1" />
                            <span className="text-xs">Todo</span>
                        </Link>
                        <Link href="/users/profile" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <IconMenuUsers className="w-5 h-5 mb-1" />
                            <span className="text-xs">Profile</span>
                        </Link>
                        <Link href="/auth/boxed-signin" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            <IconLogout className="w-5 h-5 mb-1" />
                            <span className="text-xs">Sign Out</span>
                        </Link>
                    </div>

                    <div className="dropdown shrink-0 ml-auto">
                        <Dropdown
                            offset={[0, 8]}
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            button={
                                <span>
                                    <IconSun className="hidden dark:flex w-5 h-5" />
                                    <IconMoon className="flex dark:hidden w-5 h-5" />
                                    <IconLaptop className="hidden dark:flex w-5 h-5" />
                                </span>
                            }
                        >
                            <ul className="!px-2 text-dark dark:text-white-dark grid font-semibold dark:text-white-light/90">
                                <li>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 rounded px-4 py-2 text-left hover:bg-gray-100/70 dark:hover:bg-gray-900/60 ${themeConfig.theme === 'light' ? '!bg-gray-100/70 dark:!bg-gray-900/60' : ''}`}
                                        onClick={() => toggleThemeHandler('light')}
                                    >
                                        <IconSun className="h-5 w-5 shrink-0" />
                                        Light
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 rounded px-4 py-2 text-left hover:bg-gray-100/70 dark:hover:bg-gray-900/60 ${themeConfig.theme === 'dark' ? '!bg-gray-100/70 dark:!bg-gray-900/60' : ''}`}
                                        onClick={() => toggleThemeHandler('dark')}
                                    >
                                        <IconMoon className="h-5 w-5 shrink-0" />
                                        Dark
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 rounded px-4 py-2 text-left hover:bg-gray-100/70 dark:hover:bg-gray-900/60 ${themeConfig.theme === 'system' ? '!bg-gray-100/70 dark:!bg-gray-900/60' : ''}`}
                                        onClick={() => toggleThemeHandler('system')}
                                    >
                                        <IconLaptop className="h-5 w-5 shrink-0" />
                                        System
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>

                    <div className="dropdown shrink-0">
                        <Dropdown
                            offset={[0, 8]}
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            button={
                                <span>
                                    <IconChatNotification className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/50 opacity-75"></span>
                                            <span className="relative inline-flex w-3 h-3 rounded-full bg-success"></span>
                                        </span>
                                    )}
                                </span>
                            }
                        >
                            <ul className="!px-0 text-dark dark:text-white-dark w-[300px] sm:w-[375px] divide-y dark:divide-white/10">
                                <li onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center px-4 py-2">
                                        <div className="text-lg font-bold">Notifications</div>
                                        {unreadCount > 0 && (
                                            <span className="badge bg-primary/80 text-xs text-white hover:bg-primary ltr:ml-auto rtl:mr-auto">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                </li>
                                {isNotificationsLoading ? (
                                    <li>
                                        <div className="py-4 text-center">Loading notifications...</div>
                                    </li>
                                ) : notificationsError ? (
                                    <li>
                                        <div className="py-4 text-center text-danger">{notificationsError}</div>
                                    </li>
                                ) : notifications.length === 0 ? (
                                    <li>
                                        <div className="py-4 text-center">No notifications</div>
                                    </li>
                                ) : (
                                    <>
                                        {notifications.slice(0, 5).map((notification) => (
                                            <li key={notification.id} onClick={(e) => e.stopPropagation()}>
                                                <div
                                                    className={`py-2 px-4 hover:bg-gray-100/70 dark:hover:bg-gray-900/60 cursor-pointer ${!notification.read ? 'bg-gray-100/70 dark:bg-gray-900/60' : ''}`}
                                                    onClick={() => handleNotificationClick(notification.id)}
                                                >
                                                    <div className="flex">
                                                        <div className="shrink-0">
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <IconMail className="w-5 h-5 text-primary" />
                                                            </div>
                                                        </div>
                                                        <div className="ltr:ml-3 rtl:mr-3 flex-1">
                                                            <h4 className="font-semibold text-primary">{notification.title}</h4>
                                                            <p className="text-sm line-clamp-1">{notification.message}</p>
                                                            <div className="text-xs text-white-dark dark:text-gray-500">
                                                                {new Date(notification.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                        <li className="border-t border-white-light px-4 py-2 dark:border-white/10">
                                            <button
                                                type="button"
                                                className="text-center w-full font-bold text-primary hover:text-opacity-90"
                                                onClick={() => router.push('/apps/chat')}
                                            >
                                                View All Notifications
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;