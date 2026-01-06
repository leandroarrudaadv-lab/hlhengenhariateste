import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200 border border-gray-100 dark:border-white/5">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined text-[32px]">
                            {isDanger ? 'delete_forever' : 'help'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all active:scale-95 ${isDanger ? 'bg-red-500 shadow-red-500/30' : 'bg-primary shadow-primary/30'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
