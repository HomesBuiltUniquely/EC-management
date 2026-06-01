import { HowsLogo } from "../Component/HowsLogo";
import { LoginForm } from "../Component/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen">
            {/* Brand panel */}
            <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 to-blue-900 p-12 text-white lg:flex">
                <div>
                    <div className="flex items-center gap-3">
                        <HowsLogo size={40} className="bg-white/10" />
                        <span className="text-lg font-bold">
                            HOWS <span className="font-normal text-blue-200">| Experience Center</span>
                        </span>
                    </div>
                    <h1 className="mt-16 text-4xl font-extrabold leading-tight">
                        Experience Center
                        <br />
                        Management
                    </h1>
                    <p className="mt-4 max-w-md text-blue-100">
                        Manage walk-ins, room bookings, designer assignments, and live floor
                        status — all in one place.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                        <span className="text-2xl">🏢</span>
                        <div>
                            <p className="text-sm font-semibold">5 Rooms</p>
                            <p className="text-xs text-blue-200">Room 1–3, Boardroom, Pavillion 2.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <p className="text-sm font-semibold">Live Floor View</p>
                            <p className="text-xs text-blue-200">Real-time room status tracking</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
                <div className="mb-8 flex items-center gap-2 lg:hidden">
                    <HowsLogo size={32} />
                    <span className="text-sm font-bold text-gray-900">HOWS Experience Center</span>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
