import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-white p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-3">
                            <img
                                src="https://mangrovecorp.id/assets/img/logo.png"
                                alt="Mangrove Corp"
                                className="h-10 object-contain"
                            />
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                            <p className="text-center text-sm text-gray-500">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
