import useApp from "../../contexts/useApp";
import { apiService } from "../../services/apiService";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

function useSidbar() {
    const { state, dispatch } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [newHobby, setNewHobby] = useState('');
    const [availableHobbies, setAvailableHobbies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [draggedHobby, setDraggedHobby] = useState<string | null>(null);
    const loadAvailableHobbies = async () => {
        try {
            const hobbies = await apiService.getAllHobbies();
            setAvailableHobbies(hobbies);
        } catch (error) {
            console.error('Error loading hobbies:', error);
            // If backend fails, fall back to extracting from users
            const hobbiesFromUsers = Array.from(
                new Set(state.users.flatMap(user =>
                    Array.isArray(user.hobbies) ? user.hobbies : []
                ))
            );
            setAvailableHobbies(hobbiesFromUsers);
        }
    };

    
    useEffect(() => {
        loadAvailableHobbies();
    }, [state.users]);
        
    useEffect(() => {

    }, [state.users.length,state])

  
    const filteredHobbies = availableHobbies.filter(hobby =>
        hobby.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDragStart = (event: React.DragEvent, hobby: string) => {
        console.log('🟢 Drag started for hobby:', hobby);

        // Set both text/plain and application/hobby data
        event.dataTransfer.setData('text/plain', hobby);
        event.dataTransfer.setData('application/hobby', hobby);
        event.dataTransfer.effectAllowed = 'copy';

        setDraggedHobby(hobby);

        // Add visual feedback
        const element = event.currentTarget as HTMLElement;
        element.style.opacity = '0.4';
        element.style.backgroundColor = '#e3f2fd';
    };

    const handleDragEnd = (event: React.DragEvent) => {
        console.log('🔴 Drag ended');

        const element = event.currentTarget as HTMLElement;
        element.style.opacity = '1';
        element.style.backgroundColor = 'white';

        setDraggedHobby(null);
    };

    const handleAddHobby = async () => {
        const hobbyName = newHobby.trim();

        if (!hobbyName) {
            toast.error('Please enter a hobby name');
            return;
        }

        if (hobbyName.length < 2) {
            toast.error('Hobby name must be at least 2 characters long');
            return;
        }

        setIsLoading(true);

        try {
            // Add to backend first
            await apiService.addHobby(hobbyName);

            // Update local state
            setAvailableHobbies(prev => {
                const newHobbies = [...prev, hobbyName];
                return Array.from(new Set(newHobbies)).sort();
            });

            setNewHobby('');
            toast.success(`Hobby "${hobbyName}" added successfully!`);

            // Refresh the hobbies list from backend to ensure consistency
            setTimeout(() => {
                loadAvailableHobbies();
            }, 100);

        } catch (error: any) {
            console.error('Error adding hobby:', error);

            if (error.response?.status === 400) {
                toast.error(error.response.data.error || 'Failed to add hobby');
            } else if (error.code === 'ECONNREFUSED') {
                // If backend is not available, add to local state only
                setAvailableHobbies(prev => {
                    const newHobbies = [...prev, hobbyName];
                    return Array.from(new Set(newHobbies)).sort();
                });
                setNewHobby('');
                toast.success(`Hobby "${hobbyName}" added locally (backend unavailable)`);
            } else {
                toast.error('Failed to add hobby. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveHobby = async (hobby: string) => {
        if (!window.confirm(`Are you sure you want to remove the hobby "${hobby}"?`)) {
            return;
        }

        try {
            await apiService.removeHobby(hobby);

            // Update local state
            setAvailableHobbies(prev => prev.filter(h => h !== hobby));
            toast.success(`Hobby "${hobby}" removed successfully`);

            // Refresh the list
            setTimeout(() => {
                loadAvailableHobbies();
            }, 100);

        } catch (error: any) {
            console.error('Error removing hobby:', error);
            toast.error('Failed to remove hobby. Please try again.');
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        console.log('Hobby dropped in sidebar area');
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddHobby();
        }
    };

    return {
        handleAddHobby, handleDragEnd, handleDragOver, handleDragStart,
        handleKeyPress, handleDrop, handleRemoveHobby, filteredHobbies, dispatch, state,
        setDraggedHobby, searchTerm, setSearchTerm, isLoading, draggedHobby, newHobby,
        loadAvailableHobbies,setNewHobby
    };
}
export default useSidbar;