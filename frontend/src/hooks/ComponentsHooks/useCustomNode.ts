import { apiService } from "../../services/apiService";
import toast from "react-hot-toast";
import { useState } from "react";
import useApp from "../../contexts/useApp";
import { CustomNodeType } from "../../types/CustomNodeType";
import { useEffect } from "react";
function useCustomNode({ data, selected, id }:CustomNodeType) {
  const { state, dispatch } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const nodeSize = Math.max(80, Math.min(120, 80 + data.popularityScore * 3));
  const intensity = Math.min(100, Math.max(20, data.popularityScore * 12));
  const currentUser = state.users.find(u => u.id === id);
  const friendsCount = currentUser?.friends?.length || 0;
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);

    (event.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
    (event.currentTarget as HTMLElement).style.transform = '0 0 20px rgba(0, 123, 255, 0.6)';
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    (event.currentTarget as HTMLElement).style.transform = 'scale(1.0)';
   (event.currentTarget as HTMLElement).style.transform = selected
      ? '0 8px 25px rgba(0, 123, 255, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)';
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    (event.currentTarget as HTMLElement).style.transform = 'scale(1.0)';
    (event.currentTarget as HTMLElement).style.transform = selected
      ? '0 8px 25px rgba(0, 123, 255, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)';

    let hobby = event.dataTransfer.getData('application/hobby');
    if (!hobby) {
      hobby = event.dataTransfer.getData('text/plain');
    }

    if (hobby) {
      try {
        const user = state.users.find(u => u.id === id);
        if (user) {
          const currentHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];

          if (currentHobbies.includes(hobby)) {
            toast.error(`"${data.username}" already has the hobby "${hobby}"`);
            return;
          }

          const oldScore = data.popularityScore;
          toast.loading(
            `Adding "${hobby}" to ${data.username}... (Score: ${oldScore.toFixed(1)})`,
            { id: 'add-hobby' }
          );

          const updatedHobbies = [...currentHobbies, hobby];
          await apiService.updateUser(id, { hobbies: updatedHobbies });
          await new Promise(resolve => setTimeout(resolve, 800));
          const [graphData, users] = await Promise.all([
            apiService.getGraphData(),
            apiService.getAllUsers()
          ]);
          dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
          dispatch({ type: 'SET_USERS', payload: users });
          const updatedUser = users.find((u: any) => u.id === id);
          const newScore = updatedUser ?
            (typeof updatedUser.popularityScore === 'number' ? updatedUser.popularityScore : parseFloat(updatedUser.popularityScore || '0'))
            : oldScore;

          if (newScore === oldScore && friendsCount === 0) {
            toast.success(
              `Added "${hobby}" to ${data.username}! 🎯\nScore still 0.0 - connect with friends to see it increase!`,
              {
                id: 'add-hobby',
                duration: 6000
              }
            );
          } else {
            toast.success(
              `Added "${hobby}" to ${data.username}! 🎯\nScore: ${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`,
              {
                id: 'add-hobby',
                duration: 5000
              }
            );
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to add hobby to user', { id: 'add-hobby' });
      }
    } else {
      toast.error('Could not read the hobby data. Please try again.');
    }
  };

  const nodeStyle = {
    width: nodeSize,
    height: nodeSize,
    backgroundColor: isDragOver
      ? `hsl(210, 80%, ${80 - intensity}%)`
      : `hsl(210, 70%, ${100 - intensity}%)`,
    border: isDragOver
      ? '3px solid #28a745'
      : selected
        ? '3px solid #007bff'
        : '2px solid #ccc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'white',
    fontWeight: 'bold',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isDragOver
      ? '0 0 25px rgba(40, 167, 69, 0.6)'
      : selected
        ? '0 8px 25px rgba(0, 123, 255, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: isDragOver ? 1000 : 1,
  };
    
    useEffect(() => {

    }, [state.users.length,state])
  const getScoreColor = () => {
    if (data.popularityScore > 7) return '#ff4757';
    if (data.popularityScore > 4) return '#ffa502';
    return '#2ed573';
  };
  return {
    state, dispatch, isDragOver, isFinite, setIsDragOver,
    nodeSize, intensity, currentUser, friendsCount,
    handleDragLeave, handleDragOver, handleDrop, nodeStyle, getScoreColor,
    showTooltip, setShowTooltip
  }

}
export default useCustomNode;