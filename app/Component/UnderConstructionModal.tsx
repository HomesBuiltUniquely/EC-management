type UnderConstructionModalProps = {
    featureName: string;
    onClose: () => void;
};

export function UnderConstructionModal({
    featureName,
    onClose,
}: UnderConstructionModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                    🚧
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">Under Construction</h3>
                <p className="mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{featureName}</span> is
                    coming soon. We&apos;re building this feature for you.
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
