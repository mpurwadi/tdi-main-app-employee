
import Link from 'next/link';
import React from 'react';

const LandingPage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                        Sistem Manajemen Karyawan TDI
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Solusi terintegrasi untuk manajemen absensi, logbook, dan operasional kantor.
                    </p>
                    <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
                        Memungkinkan karyawan dan admin mengelola absensi, logbook harian, dan jadwal kerja remote dalam satu platform yang mudah digunakan.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="/auth/boxed-signin"
                            className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/boxed-signup"
                            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                        >
                            Daftar <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Made with Love by mpurwadi</p>
            </footer>
        </div>
    );
};

export default LandingPage;
