'use client';

interface ProGateProps {
    isPro: boolean;
    children: React.ReactNode;
    placeholder?: string;
}

export const ProGate = ({ isPro, children, placeholder = "████████" }: ProGateProps) => {
    if (isPro) return <>{children}</>;
    return (
        <span className="blur-[3px] select-none text-slate-400" title="Upgrade to Pro to reveal">
            {placeholder}
        </span>
    );
};

export const MaskedText = ({ text, show }: { text: string; show: boolean }) => {
    if (show) return <>{text}</>;
    return <span className="text-slate-400 select-none">{'█'.repeat(Math.min(text.length, 12))}</span>;
};

export const MaskedEmail = ({ email, show }: { email: string; show: boolean }) => {
    if (show) return <>{email}</>;
    const [user, domain] = email.split('@');
    return <span className="text-slate-400 select-none">{'█'.repeat(user?.length || 4)}@{'█'.repeat(domain?.length || 6)}</span>;
};
