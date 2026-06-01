import Image from "next/image";

type HowsLogoProps = {
    size?: number;
    className?: string;
};

export function HowsLogo({ size = 32, className = "" }: HowsLogoProps) {
    return (
        <Image
            src="/hows-logo.png"
            alt="HOWS Experience Center"
            width={size}
            height={size}
            className={`shrink-0 rounded-lg object-contain ${className}`}
            priority
        />
    );
}
