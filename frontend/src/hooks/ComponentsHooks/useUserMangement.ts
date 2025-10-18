


import { useApp } from '../../contexts/AppContext';
import { CreateUserRequest } from '../../types';
import { apiService } from '../../services/apiService';
import { useState } from 'react';
import toast from 'react-hot-toast';

function useUserMangement() {
    const { state, dispatch } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        age: 25,
        hobbies: []
    });
    const [newHobby, setNewHobby] = useState('');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username.trim()) {
            toast.error('Username is required');
            return;
        }

        if (formData.age <= 0 || formData.age > 150) {
            toast.error('Age must be between 1 and 150');
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newUser = await apiService.createUser(formData);

            // Refresh graph data
            const graphData = await apiService.getGraphData();
            dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });

            // Refresh users list
            const users = await apiService.getAllUsers();
            dispatch({ type: 'SET_USERS', payload: users });

            toast.success(`User "${formData.username}" created successfully`);
            setIsCreating(false);
            setFormData({ username: '', age: 25, hobbies: [] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create user');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!window.confirm(`Are you sure you want to delete "${username}"?`)) {
            return;
        }
        const toastId = `connection-${Date.now()}`;
        try {
            toast.loading('Removing the User...', { id: toastId });
            await apiService.deleteUser(userId);

            // Refresh graph data
            const graphData = await apiService.getGraphData();
            dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });

            // Refresh users list
            const users = await apiService.getAllUsers();
            dispatch({ type: 'SET_USERS', payload: users });
            toast.dismiss(toastId);
            toast.success('User deleted successfully');
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.dismiss(toastId);
                toast.error('Cannot delete user with active relationships');
            } else {
                toast.dismiss(toastId);
                toast.error('Failed to delete user');
            }
        }
    };

    const addHobby = () => {
        const hobby = newHobby.trim();
        if (hobby && !formData.hobbies.includes(hobby)) {
            setFormData(prev => ({
                ...prev,
                hobbies: [...prev.hobbies, hobby]
            }));
            setNewHobby('');
        }
    };

    const removeHobby = (hobbyToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
        }));
    };

    // Helper function to safely format popularity score
    const formatPopularityScore = (score: any): string => {
        if (score === null || score === undefined) return '0.0';

        const numScore = typeof score === 'string' ? parseFloat(score) : Number(score);

        if (isNaN(numScore)) {
            console.warn('Invalid popularity score:', score);
            return '0.0';
        }

        return numScore.toFixed(1);
    };

    // Helper function to ensure hobbies is always an array
    const getHobbiesDisplay = (hobbies: any): string => {
        if (!hobbies) return 'None';
        if (Array.isArray(hobbies)) return hobbies.join(', ') || 'None';
        return 'None';
    };

    // Helper function to ensure friends is always an array
    const getFriendsCount = (friends: any): number => {
        if (!friends) return 0;
        if (Array.isArray(friends)) return friends.length;
        return 0;
    };
    return {
        state, isCreating, setIsCreating, handleCreateUser, handleDeleteUser,newHobby,
        addHobby, removeHobby, formatPopularityScore, getHobbiesDisplay, getFriendsCount,formData,setFormData
    }
}
export default useUserMangement;