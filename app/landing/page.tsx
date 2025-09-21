'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

// Icon components
const IconNews = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

const IconAnnouncement = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const IconCompany = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconArrow = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-5 w-5 ${direction === 'right' ? 'rotate-180' : ''}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const LandingPage = () => {
    const [news, setNews] = useState<{ id: number; title: string; excerpt: string; date: string }[]>([]);
    const [announcements, setAnnouncements] = useState<{ id: number; title: string; content: string; priority: string }[]>([]);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    // Sample features data
    const features: { id: number; title: string; description: string; icon: JSX.Element }[] = [
        {
            id: 1,
            title: 'Attendance Tracking',
            description: 'QR code-based clock-in/out system with geofencing validation for accurate location tracking.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 2,
            title: 'User Logbook',
            description: 'Daily activity logging for users with on-site vs. remote work tracking and supervisor approval workflow.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: 3,
            title: 'Financial Management',
            description: 'Track income and expenses with category management and visual reporting for better financial insights.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 4,
            title: 'Remote Work Scheduling',
            description: 'Request and approve remote work with calendar-based scheduling and team analytics.',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        // Fetch news and announcements from API
        const fetchNewsAndAnnouncements = async () => {
            try {
                const response = await fetch('/api/public/news');
                const data = await response.json();
                
                if (data.success) {
                    // Separate news and announcements
                    const newsItems = data.data
                        .filter((item: any) => item.category === 'news')
                        .map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            excerpt: item.content.substring(0, 100) + '...',
                            date: new Date(item.publishedAt).toLocaleDateString()
                        }));
                    
                    const announcementItems = data.data
                        .filter((item: any) => item.category === 'announcement')
                        .map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            content: item.content,
                            priority: 'medium' // Default priority, you might want to add this to the database
                        }));
                    
                    setNews(newsItems);
                    setAnnouncements(announcementItems);
                }
            } catch (error) {
                console.error('Failed to fetch news and announcements:', error);
                // Fallback to sample data if API fails
                setNews(sampleNews);
                setAnnouncements(sampleAnnouncements);
            }
        };

        fetchNewsAndAnnouncements();
    }, []);

    // Sample news data
    const sampleNews = [
        {
            id: 1,
            title: 'New Remote Work Policy Launched',
            excerpt: 'We are excited to announce our new flexible remote work policy effective next month.',
            date: '2025-09-10',
        },
        {
            id: 2,
            title: 'System Maintenance Scheduled',
            excerpt: 'Planned maintenance will occur this weekend. Please save your work before 6 PM Friday.',
            date: '2025-09-08',
        },
        {
            id: 3,
            title: 'User Recognition Program',
            excerpt: 'Nominations are now open for our quarterly user recognition awards.',
            date: '2025-09-05',
        },
    ];

    // Sample announcements data
    const sampleAnnouncements = [
        {
            id: 1,
            title: 'Office Closure for Public Holiday',
            content: 'The office will be closed on September 15th for the local public holiday.',
            priority: 'high',
        },
        {
            id: 2,
            title: 'Security Training Session',
            content: 'All users must attend the mandatory security training on September 20th.',
            priority: 'medium',
        },
        {
            id: 3,
            title: 'New Parking Arrangements',
            content: 'Updated parking arrangements will be in effect starting September 12th.',
            priority: 'low',
        },
    ];

    return (
        <div className={`min-h-screen ${themeConfig.theme === 'dark' ? 'dark bg-black' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`shadow-sm ${themeConfig.theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <IconCompany />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">TDI Service Management</h1>
                    </div>
                    <nav className="hidden md:flex space-x-6">
                        <Link href="/auth/cover-login" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary font-medium">
                            Login
                        </Link>
                        <Link href="/auth/cover-register" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary font-medium">
                            Register
                        </Link>
                    </nav>
                    <button className="md:hidden text-gray-600 dark:text-gray-400">
                        <IconMenu />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Manage Your Team <span className="text-primary">Efficiently</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                        A comprehensive service management system with attendance tracking, financial management, and remote work scheduling.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            href="/auth/cover-register" 
                            className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                        >
                            Get Started
                        </Link>
                        <Link 
                            href="/auth/cover-login" 
                            className="bg-white hover:bg-gray-100 text-primary border border-primary font-semibold py-3 px-8 rounded-lg transition duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Carousel */}
            <section className={`py-16 ${themeConfig.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Everything you need to manage your services, track attendance, and handle finances.
                        </p>
                    </div>

                    {/* Swiper Carousel */}
                    <div className="max-w-4xl mx-auto panel">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            navigation={{
                                nextEl: '.swiper-button-next-ex1',
                                prevEl: '.swiper-button-prev-ex1',
                            }}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000 }}
                            className="swiper rounded-xl overflow-hidden"
                            dir={themeConfig.rtlClass}
                            key={themeConfig.rtlClass}
                        >
                            {features.map((feature) => (
                                <SwiperSlide key={feature.id} className="!flex items-center p-8">
                                    <div className="flex flex-col md:flex-row items-center w-full">
                                        <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                                            {feature.icon}
                                        </div>
                                        <div className="md:w-2/3 text-center md:text-left">
                                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                                            <p className="text-lg text-gray-600 dark:text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                            <button className="swiper-button-prev-ex1 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1 text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:left-2 rtl:right-2">
                                <IconArrow direction="left" />
                            </button>
                            <button className="swiper-button-next-ex1 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1 text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:right-2 rtl:left-2">
                                <IconArrow direction="right" />
                            </button>
                        </Swiper>
                    </div>
                </div>
            </section>

            {/* News and Announcements */}
            <section className={`py-16 ${themeConfig.theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest News & Announcements</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Stay updated with the latest news and important announcements from our team.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* News Section */}
                        <div className={`rounded-xl shadow-md p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                            <div className="flex items-center mb-6">
                                <div className="bg-primary/10 text-primary p-2 rounded-lg mr-4">
                                    <IconNews />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">News</h3>
                            </div>
                            
                            <div className="space-y-6">
                                {news.map((item) => (
                                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.date}</span>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-1 mb-2">{item.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{item.excerpt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Announcements Section */}
                        <div className={`rounded-xl shadow-md p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                            <div className="flex items-center mb-6">
                                <div className="bg-warning/10 text-warning p-2 rounded-lg mr-4">
                                    <IconAnnouncement />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h3>
                            </div>
                            
                            <div className="space-y-6">
                                {announcements.map((item) => (
                                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                                            item.priority === 'high' 
                                                ? 'bg-danger/20 text-danger' 
                                                : item.priority === 'medium' 
                                                    ? 'bg-warning/20 text-warning' 
                                                    : 'bg-success/20 text-success'
                                        }`}>
                                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className={`py-16 ${themeConfig.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built with Modern Technology</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Thanks to the powerful tools and technologies that made this application possible
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className={`rounded-xl shadow-md p-8 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">VSCode</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Development Environment</p>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Qwen Coder</h3>
                                    <p className="text-gray-600 dark:text-gray-400">AI Coding Assistant</p>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gemini CLI</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Vristo Development</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    This application was built with the help of modern development tools and AI assistants
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            

            {/* Footer */}
            <footer className={`py-12 ${themeConfig.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-900'} text-white`}>
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        
                        <div className="border-t border-gray-800 pt-8">
                            <p className="text-gray-500">
                                Made with Love by mpurwadi
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;