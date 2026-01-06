import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Collaborator } from '../types';
import { COLLABORATORS } from '../constants';

interface CollaboratorContextType {
    collaborators: Collaborator[];
    addCollaborator: (collaborator: Collaborator) => void;
    removeCollaborator: (id: string) => void;
    updateCollaborator: (id: string, updates: Partial<Collaborator>) => void;
    getCollaborator: (id: string) => Collaborator | undefined;
}

const CollaboratorContext = createContext<CollaboratorContextType | undefined>(undefined);

export const CollaboratorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
        const saved = localStorage.getItem('collaborators');
        return saved ? JSON.parse(saved) : COLLABORATORS;
    });

    // Save to localStorage whenever collaborators change
    React.useEffect(() => {
        localStorage.setItem('collaborators', JSON.stringify(collaborators));
    }, [collaborators]);

    const addCollaborator = (collaborator: Collaborator) => {
        setCollaborators((prev) => [...prev, collaborator]);
    };

    const removeCollaborator = (id: string) => {
        setCollaborators((prev) => prev.filter((c) => c.id !== id));
    };

    const updateCollaborator = (id: string, updates: Partial<Collaborator>) => {
        setCollaborators((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
    };

    const getCollaborator = (id: string) => {
        return collaborators.find((c) => c.id === id);
    };

    return (
        <CollaboratorContext.Provider value={{ collaborators, addCollaborator, removeCollaborator, updateCollaborator, getCollaborator }}>
            {children}
        </CollaboratorContext.Provider>
    );
};

export const useCollaborators = () => {
    const context = useContext(CollaboratorContext);
    if (context === undefined) {
        throw new Error('useCollaborators must be used within a CollaboratorProvider');
    }
    return context;
};
