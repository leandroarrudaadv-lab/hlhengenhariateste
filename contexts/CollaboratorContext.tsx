import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Collaborator } from '../types';
import { COLLABORATORS } from '../constants';
import { supabase } from '../lib/supabase';

interface CollaboratorContextType {
    collaborators: Collaborator[];
    loading: boolean;
    addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => Promise<void>;
    removeCollaborator: (id: string) => Promise<void>;
    updateCollaborator: (id: string, updates: Partial<Collaborator>) => Promise<void>;
    getCollaborator: (id: string) => Collaborator | undefined;
}

const CollaboratorContext = createContext<CollaboratorContextType | undefined>(undefined);

export const CollaboratorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollaborators();
    }, []);

    const fetchCollaborators = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('collaborators')
                .select(`
                    *,
                    projects (name)
                `);

            if (error) throw error;

            if (data) {
                setCollaborators(data.map(c => ({
                    id: c.id,
                    name: c.name,
                    role: c.role,
                    salary: c.salary,
                    currentProject: c.projects?.name || '',
                    photo: c.photo || `https://picsum.photos/seed/${c.id}/150/150`
                })));
            }
        } catch (error) {
            console.error('Error fetching collaborators:', error);
            setCollaborators(COLLABORATORS);
        } finally {
            setLoading(false);
        }
    };

    const addCollaborator = async (collaborator: Omit<Collaborator, 'id'>) => {
        try {
            // Find project ID by name if needed, or we might need to change the API to take ID
            // For now, assume we just insert.
            const { error } = await supabase
                .from('collaborators')
                .insert([{
                    name: collaborator.name,
                    role: collaborator.role,
                    salary: collaborator.salary,
                    photo: collaborator.photo
                }]);

            if (error) throw error;
            await fetchCollaborators();
        } catch (error) {
            console.error('Error adding collaborator:', error);
        }
    };

    const removeCollaborator = async (id: string) => {
        try {
            const { error } = await supabase
                .from('collaborators')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCollaborators(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error removing collaborator:', error);
        }
    };

    const updateCollaborator = async (id: string, updates: Partial<Collaborator>) => {
        try {
            const { error } = await supabase
                .from('collaborators')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchCollaborators();
        } catch (error) {
            console.error('Error updating collaborator:', error);
        }
    };

    const getCollaborator = (id: string) => {
        return collaborators.find((c) => c.id === id);
    };

    return (
        <CollaboratorContext.Provider value={{ collaborators, loading, addCollaborator, removeCollaborator, updateCollaborator, getCollaborator }}>
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
